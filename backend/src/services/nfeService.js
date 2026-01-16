const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

class NFeService {
  /**
   * Get or create NFe configuration for account
   */
  async getConfig(accountId) {
    let config = await prisma.nFeConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      config = await prisma.nFeConfig.create({
        data: {
          accountId,
          environment: 'homologacao',
        },
      });
    }

    return config;
  }

  /**
   * Update NFe configuration
   */
  async updateConfig(accountId, data) {
    const config = await prisma.nFeConfig.upsert({
      where: { accountId },
      update: data,
      create: {
        accountId,
        ...data,
      },
    });

    return config;
  }

  /**
   * Upload and process digital certificate
   */
  async uploadCertificate(accountId, certificateBuffer, password) {
    try {
      // Validate certificate (basic check)
      // In production, use node-forge to validate PFX/P12

      const config = await prisma.nFeConfig.upsert({
        where: { accountId },
        update: {
          certificateData: certificateBuffer,
          certificatePassword: password,
          // Extract expiry from certificate in production
          certificateExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year placeholder
        },
        create: {
          accountId,
          certificateData: certificateBuffer,
          certificatePassword: password,
          certificateExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        message: 'Certificado carregado com sucesso',
        expiry: config.certificateExpiry,
      };
    } catch (error) {
      throw AppError.badRequest('Erro ao processar certificado: ' + error.message);
    }
  }

  /**
   * Generate NFe for invoice
   */
  async generateNFe(invoiceId, accountId) {
    const config = await prisma.nFeConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      throw AppError.badRequest('Configuração fiscal não encontrada. Configure os dados fiscais primeiro.');
    }

    if (!config.cnpj || !config.inscricaoEstadual) {
      throw AppError.badRequest('CNPJ e Inscrição Estadual são obrigatórios para emissão de NFe');
    }

    if (!config.certificateData) {
      throw AppError.badRequest('Certificado digital não configurado');
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        accountId,
      },
      include: {
        client: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!invoice) {
      throw AppError.notFound('Fatura não encontrada');
    }

    if (invoice.status === 'cancelled') {
      throw AppError.badRequest('Não é possível emitir NFe para fatura cancelada');
    }

    // Check if already has NFe
    const existingNFe = await prisma.nFeRecord.findFirst({
      where: {
        invoiceId,
        status: 'authorized',
      },
    });

    if (existingNFe) {
      throw AppError.badRequest('Esta fatura já possui uma NFe autorizada');
    }

    // Get next NFe number
    const nextNumber = config.ultimoNumeroNFe + 1;

    // Generate access key (44 digits)
    const chaveAcesso = this.generateAccessKey(config, nextNumber);

    // Create NFe record
    const nfeRecord = await prisma.nFeRecord.create({
      data: {
        nfeConfigId: config.id,
        invoiceId,
        tipo: 'NFe',
        numero: nextNumber,
        serie: config.serieNFe,
        chaveAcesso,
        status: 'pending',
      },
    });

    // Update last number
    await prisma.nFeConfig.update({
      where: { id: config.id },
      data: { ultimoNumeroNFe: nextNumber },
    });

    // Generate XML
    const xml = await this.generateNFeXML(invoice, config, nfeRecord);

    // Update record with XML
    await prisma.nFeRecord.update({
      where: { id: nfeRecord.id },
      data: { xmlEnvio: xml },
    });

    return nfeRecord;
  }

  /**
   * Generate access key (chave de acesso)
   */
  generateAccessKey(config, numero) {
    const now = new Date();
    const cUF = this.getUFCode(config.uf || 'SP');
    const AAMM = now.getFullYear().toString().slice(-2) + String(now.getMonth() + 1).padStart(2, '0');
    const CNPJ = (config.cnpj || '').replace(/\D/g, '').padStart(14, '0');
    const mod = '55'; // NFe
    const serie = String(config.serieNFe).padStart(3, '0');
    const nNF = String(numero).padStart(9, '0');
    const tpEmis = '1'; // Normal
    const cNF = crypto.randomBytes(4).readUInt32BE(0).toString().slice(0, 8).padStart(8, '0');

    const key = cUF + AAMM + CNPJ + mod + serie + nNF + tpEmis + cNF;
    const dv = this.calculateDV(key);

    return key + dv;
  }

  /**
   * Calculate verification digit (módulo 11)
   */
  calculateDV(key) {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9];
    let sum = 0;
    let weightIndex = 0;

    for (let i = key.length - 1; i >= 0; i--) {
      sum += parseInt(key[i]) * weights[weightIndex];
      weightIndex = (weightIndex + 1) % weights.length;
    }

    const remainder = sum % 11;
    const dv = remainder < 2 ? 0 : 11 - remainder;
    return dv.toString();
  }

  /**
   * Get UF code (IBGE)
   */
  getUFCode(uf) {
    const codes = {
      AC: '12', AL: '27', AP: '16', AM: '13', BA: '29',
      CE: '23', DF: '53', ES: '32', GO: '52', MA: '21',
      MT: '51', MS: '50', MG: '31', PA: '15', PB: '25',
      PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24',
      RS: '43', RO: '11', RR: '14', SC: '42', SP: '35',
      SE: '28', TO: '17',
    };
    return codes[uf] || '35';
  }

  /**
   * Generate NFe XML
   */
  async generateNFeXML(invoice, config, nfeRecord) {
    // Simplified XML structure - in production use a proper NFe library
    const now = new Date();
    const dhEmi = now.toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nfeRecord.chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${this.getUFCode(config.uf || 'SP')}</cUF>
      <cNF>${nfeRecord.chaveAcesso.slice(35, 43)}</cNF>
      <natOp>Prestacao de Servicos Veterinarios</natOp>
      <mod>55</mod>
      <serie>${nfeRecord.serie}</serie>
      <nNF>${nfeRecord.numero}</nNF>
      <dhEmi>${dhEmi}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${config.codigoMunicipio || '3550308'}</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${nfeRecord.chaveAcesso.slice(-1)}</cDV>
      <tpAmb>${config.environment === 'producao' ? '1' : '2'}</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>0</indPres>
      <procEmi>0</procEmi>
      <verProc>DUOVET-1.0</verProc>
    </ide>
    <emit>
      <CNPJ>${(config.cnpj || '').replace(/\D/g, '')}</CNPJ>
      <xNome>${config.razaoSocial || ''}</xNome>
      <xFant>${config.nomeFantasia || ''}</xFant>
      <enderEmit>
        <xLgr>${config.logradouro || ''}</xLgr>
        <nro>${config.numero || ''}</nro>
        <xBairro>${config.bairro || ''}</xBairro>
        <cMun>${config.codigoMunicipio || ''}</cMun>
        <xMun>${config.municipio || ''}</xMun>
        <UF>${config.uf || ''}</UF>
        <CEP>${(config.cep || '').replace(/\D/g, '')}</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
      </enderEmit>
      <IE>${(config.inscricaoEstadual || '').replace(/\D/g, '')}</IE>
      <CRT>${this.getCRT(config.regimeTributario)}</CRT>
    </emit>
    <dest>
      <CPF>${(invoice.client.document || '').replace(/\D/g, '').slice(0, 11)}</CPF>
      <xNome>${invoice.client.name}</xNome>
      <enderDest>
        <xLgr>${invoice.client.address || ''}</xLgr>
        <xBairro>-</xBairro>
        <cMun>9999999</cMun>
        <xMun>${invoice.client.city || ''}</xMun>
        <UF>${invoice.client.state || 'SP'}</UF>
        <CEP>${(invoice.client.zipCode || '').replace(/\D/g, '')}</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
      </enderDest>
      <indIEDest>9</indIEDest>
    </dest>
    ${this.generateItemsXML(invoice.items)}
    <total>
      <ICMSTot>
        <vBC>0.00</vBC>
        <vICMS>0.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${invoice.subtotal.toFixed(2)}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>${invoice.discountAmount.toFixed(2)}</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${invoice.totalAmount.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>${this.getPaymentCode(invoice.paymentMethod)}</tPag>
        <vPag>${invoice.totalAmount.toFixed(2)}</vPag>
      </detPag>
    </pag>
    <infAdic>
      <infCpl>Fatura: ${invoice.invoiceNumber}</infCpl>
    </infAdic>
  </infNFe>
</NFe>`;

    return xml;
  }

  /**
   * Generate items XML
   */
  generateItemsXML(items) {
    return items.map((item, index) => `
    <det nItem="${index + 1}">
      <prod>
        <cProd>${item.id.slice(0, 60)}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${item.description.slice(0, 120)}</xProd>
        <NCM>00000000</NCM>
        <CFOP>5933</CFOP>
        <uCom>UN</uCom>
        <qCom>${item.quantity.toFixed(4)}</qCom>
        <vUnCom>${item.unitPrice.toFixed(10)}</vUnCom>
        <vProd>${item.totalPrice.toFixed(2)}</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>UN</uTrib>
        <qTrib>${item.quantity.toFixed(4)}</qTrib>
        <vUnTrib>${item.unitPrice.toFixed(10)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS>
          <ICMSSN102>
            <orig>0</orig>
            <CSOSN>102</CSOSN>
          </ICMSSN102>
        </ICMS>
        <PIS>
          <PISNT>
            <CST>07</CST>
          </PISNT>
        </PIS>
        <COFINS>
          <COFINSNT>
            <CST>07</CST>
          </COFINSNT>
        </COFINS>
      </imposto>
    </det>`).join('');
  }

  /**
   * Get CRT code
   */
  getCRT(regime) {
    const codes = {
      simples_nacional: '1',
      simples_nacional_excesso: '2',
      lucro_presumido: '3',
      lucro_real: '3',
    };
    return codes[regime] || '1';
  }

  /**
   * Get payment code
   */
  getPaymentCode(method) {
    const codes = {
      cash: '01',
      card: '03',
      pix: '17',
      bank_transfer: '03',
      check: '02',
    };
    return codes[method] || '99';
  }

  /**
   * Send NFe to SEFAZ
   */
  async sendToSEFAZ(nfeRecordId) {
    const nfeRecord = await prisma.nFeRecord.findUnique({
      where: { id: nfeRecordId },
      include: {
        nfeConfig: true,
      },
    });

    if (!nfeRecord) {
      throw AppError.notFound('Registro de NFe não encontrado');
    }

    if (!nfeRecord.xmlEnvio) {
      throw AppError.badRequest('XML da NFe não foi gerado');
    }

    // Update status to processing
    await prisma.nFeRecord.update({
      where: { id: nfeRecordId },
      data: {
        status: 'processing',
        tentativas: nfeRecord.tentativas + 1,
        ultimaTentativa: new Date(),
      },
    });

    try {
      // In production, this would:
      // 1. Sign XML with certificate
      // 2. Send to SEFAZ webservice
      // 3. Process response

      // Simulating SEFAZ response for development
      const isHomologation = nfeRecord.nfeConfig.environment === 'homologacao';

      if (isHomologation) {
        // Simulate successful authorization in homologation
        const protocolo = `${Date.now()}`;

        await prisma.nFeRecord.update({
          where: { id: nfeRecordId },
          data: {
            status: 'authorized',
            protocolo,
            dataAutorizacao: new Date(),
            codigoStatus: '100',
            motivoStatus: 'Autorizado o uso da NF-e',
          },
        });

        // Update invoice fiscal status
        await prisma.invoice.update({
          where: { id: nfeRecord.invoiceId },
          data: {
            fiscalStatus: 'authorized',
            fiscalNumber: nfeRecord.numero.toString(),
          },
        });

        return {
          success: true,
          status: 'authorized',
          protocolo,
          message: 'NFe autorizada com sucesso (Homologação)',
        };
      } else {
        // Production: would actually call SEFAZ webservice
        throw AppError.badRequest('Integração com SEFAZ em produção ainda não implementada');
      }
    } catch (error) {
      // Update status to rejected on error
      await prisma.nFeRecord.update({
        where: { id: nfeRecordId },
        data: {
          status: 'rejected',
          codigoStatus: 'ERR',
          motivoStatus: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Cancel NFe
   */
  async cancelNFe(nfeRecordId, motivo) {
    const nfeRecord = await prisma.nFeRecord.findUnique({
      where: { id: nfeRecordId },
      include: {
        nfeConfig: true,
      },
    });

    if (!nfeRecord) {
      throw AppError.notFound('Registro de NFe não encontrado');
    }

    if (nfeRecord.status !== 'authorized') {
      throw AppError.badRequest('Somente NFe autorizadas podem ser canceladas');
    }

    if (nfeRecord.cancelada) {
      throw AppError.badRequest('Esta NFe já foi cancelada');
    }

    // Check if within cancellation period (24 hours in most states)
    const hoursSinceAuth = (Date.now() - new Date(nfeRecord.dataAutorizacao).getTime()) / (1000 * 60 * 60);
    if (hoursSinceAuth > 24) {
      throw AppError.badRequest('Prazo para cancelamento expirado (24 horas)');
    }

    // In production, would send cancellation to SEFAZ
    const protocoloCancelamento = `CANC${Date.now()}`;

    await prisma.nFeRecord.update({
      where: { id: nfeRecordId },
      data: {
        cancelada: true,
        dataCancelamento: new Date(),
        motivoCancelamento: motivo,
        protocoloCancelamento,
        status: 'cancelled',
      },
    });

    // Update invoice
    await prisma.invoice.update({
      where: { id: nfeRecord.invoiceId },
      data: {
        fiscalStatus: 'cancelled',
      },
    });

    return {
      success: true,
      protocolo: protocoloCancelamento,
      message: 'NFe cancelada com sucesso',
    };
  }

  /**
   * Get NFe status
   */
  async getNFeStatus(nfeRecordId) {
    const nfeRecord = await prisma.nFeRecord.findUnique({
      where: { id: nfeRecordId },
    });

    if (!nfeRecord) {
      throw AppError.notFound('Registro de NFe não encontrado');
    }

    return nfeRecord;
  }

  /**
   * Get NFe records for invoice
   */
  async getNFeRecords(invoiceId) {
    return prisma.nFeRecord.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all NFe records for account
   */
  async getAccountNFeRecords(accountId, filters = {}) {
    const config = await prisma.nFeConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      return [];
    }

    const where = {
      nfeConfigId: config.id,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.nFeRecord.findMany({
      where,
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            totalAmount: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
    });
  }
}

module.exports = new NFeService();
