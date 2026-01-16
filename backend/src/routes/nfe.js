const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, requirePermission, requireFeature } = require('../middlewares/auth');
const nfeService = require('../services/nfeService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Configure multer for certificate upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-pkcs12' ||
        file.originalname.endsWith('.pfx') ||
        file.originalname.endsWith('.p12')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de certificado inválido. Use .pfx ou .p12'), false);
    }
  },
});

// All routes require authentication and NFe feature
router.use(authenticate);
router.use(requireFeature('nfe'));

/**
 * @route GET /api/v1/nfe/config
 * @desc Get NFe configuration for account
 */
router.get('/config', asyncHandler(async (req, res) => {
  const config = await nfeService.getConfig(req.user.accountId);

  // Remove sensitive data
  const safeConfig = {
    ...config,
    certificateData: config.certificateData ? 'CONFIGURED' : null,
    certificatePassword: config.certificatePassword ? '********' : null,
  };

  ApiResponse.success(res, safeConfig);
}));

/**
 * @route PUT /api/v1/nfe/config
 * @desc Update NFe configuration
 */
router.put('/config', requirePermission('manage_fiscal'), asyncHandler(async (req, res) => {
  const {
    environment,
    cnpj,
    inscricaoEstadual,
    inscricaoMunicipal,
    razaoSocial,
    nomeFantasia,
    logradouro,
    numero,
    bairro,
    codigoMunicipio,
    municipio,
    uf,
    cep,
    serieNFe,
    serieNFSe,
    regimeTributario,
    codigoCnae,
    itemListaServico,
    aliquotaIss,
  } = req.body;

  const config = await nfeService.updateConfig(req.user.accountId, {
    environment,
    cnpj,
    inscricaoEstadual,
    inscricaoMunicipal,
    razaoSocial,
    nomeFantasia,
    logradouro,
    numero,
    bairro,
    codigoMunicipio,
    municipio,
    uf,
    cep,
    serieNFe,
    serieNFSe,
    regimeTributario,
    codigoCnae,
    itemListaServico,
    aliquotaIss,
  });

  ApiResponse.success(res, config, 'Configuração atualizada com sucesso');
}));

/**
 * @route POST /api/v1/nfe/certificate
 * @desc Upload digital certificate
 */
router.post('/certificate',
  requirePermission('manage_fiscal'),
  upload.single('certificate'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, 'Certificado não enviado', 400);
    }

    const { password } = req.body;
    if (!password) {
      return ApiResponse.error(res, 'Senha do certificado é obrigatória', 400);
    }

    const result = await nfeService.uploadCertificate(
      req.user.accountId,
      req.file.buffer,
      password
    );

    ApiResponse.success(res, result, 'Certificado carregado com sucesso');
  })
);

/**
 * @route POST /api/v1/nfe/generate/:invoiceId
 * @desc Generate NFe for invoice
 */
router.post('/generate/:invoiceId', requirePermission('create_invoice'), asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const nfeRecord = await nfeService.generateNFe(invoiceId, req.user.accountId);

  ApiResponse.success(res, nfeRecord, 'NFe gerada com sucesso');
}));

/**
 * @route POST /api/v1/nfe/send/:nfeRecordId
 * @desc Send NFe to SEFAZ
 */
router.post('/send/:nfeRecordId', requirePermission('create_invoice'), asyncHandler(async (req, res) => {
  const { nfeRecordId } = req.params;

  const result = await nfeService.sendToSEFAZ(nfeRecordId);

  ApiResponse.success(res, result, result.message);
}));

/**
 * @route POST /api/v1/nfe/cancel/:nfeRecordId
 * @desc Cancel NFe
 */
router.post('/cancel/:nfeRecordId', requirePermission('create_invoice'), asyncHandler(async (req, res) => {
  const { nfeRecordId } = req.params;
  const { motivo } = req.body;

  if (!motivo || motivo.length < 15) {
    return ApiResponse.error(res, 'Motivo do cancelamento é obrigatório (mínimo 15 caracteres)', 400);
  }

  const result = await nfeService.cancelNFe(nfeRecordId, motivo);

  ApiResponse.success(res, result, result.message);
}));

/**
 * @route GET /api/v1/nfe/status/:nfeRecordId
 * @desc Get NFe status
 */
router.get('/status/:nfeRecordId', asyncHandler(async (req, res) => {
  const { nfeRecordId } = req.params;

  const status = await nfeService.getNFeStatus(nfeRecordId);

  ApiResponse.success(res, status);
}));

/**
 * @route GET /api/v1/nfe/invoice/:invoiceId
 * @desc Get NFe records for invoice
 */
router.get('/invoice/:invoiceId', asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const records = await nfeService.getNFeRecords(invoiceId);

  ApiResponse.success(res, records);
}));

/**
 * @route GET /api/v1/nfe/records
 * @desc Get all NFe records for account
 */
router.get('/records', asyncHandler(async (req, res) => {
  const { status, limit } = req.query;

  const records = await nfeService.getAccountNFeRecords(req.user.accountId, {
    status,
    limit: parseInt(limit) || 50,
  });

  ApiResponse.success(res, records);
}));

/**
 * @route GET /api/v1/nfe/xml/:nfeRecordId
 * @desc Download NFe XML
 */
router.get('/xml/:nfeRecordId', asyncHandler(async (req, res) => {
  const { nfeRecordId } = req.params;

  const nfeRecord = await nfeService.getNFeStatus(nfeRecordId);

  if (!nfeRecord.xmlEnvio) {
    return ApiResponse.error(res, 'XML não disponível', 404);
  }

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename=NFe_${nfeRecord.chaveAcesso}.xml`);
  res.send(nfeRecord.xmlEnvio);
}));

module.exports = router;
