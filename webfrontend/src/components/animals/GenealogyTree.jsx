import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';
import { ROUTES } from '../../constants/routes';
import './GenealogyTree.css';

function AnimalNode({ animal, relation, expanded = false, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!animal) {
    return (
      <div className="genealogy-node unknown">
        <div className="node-avatar unknown">
          <FiUser size={20} />
        </div>
        <div className="node-info">
          <span className="node-relation">{relation}</span>
          <span className="node-name">Desconhecido</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={ROUTES.ANIMAL_DETAIL.replace(':id', animal.id)}
      className={`genealogy-node ${animal.sex === 'male' ? 'male' : 'female'}`}
    >
      <div className={`node-avatar ${animal.sex === 'male' ? 'male' : 'female'}`}>
        {animal.photoUrl ? (
          <img src={animal.photoUrl} alt={animal.identifier} />
        ) : (
          <span>{animal.identifier?.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="node-info">
        <span className="node-relation">{relation}</span>
        <span className="node-name">{animal.identifier}</span>
        {animal.name && <span className="node-subname">{animal.name}</span>}
        {animal.breed && <span className="node-breed">{animal.breed.name}</span>}
      </div>
      <div className={`node-sex-indicator ${animal.sex}`}>
        {animal.sex === 'male' ? '♂' : '♀'}
      </div>
    </Link>
  );
}

function ParentSection({ title, parent, grandSire, grandDam }) {
  const [showGrandparents, setShowGrandparents] = useState(false);

  return (
    <div className="parent-section">
      <div className="parent-header">
        <h4>{title}</h4>
        {(grandSire || grandDam) && (
          <button
            className="expand-btn"
            onClick={() => setShowGrandparents(!showGrandparents)}
          >
            {showGrandparents ? <FiChevronUp /> : <FiChevronDown />}
            <span>Avós</span>
          </button>
        )}
      </div>

      <AnimalNode
        animal={parent}
        relation={title === 'Linha Paterna' ? 'Pai' : 'Mãe'}
      />

      {showGrandparents && (
        <div className="grandparents-row">
          <AnimalNode animal={grandSire} relation="Avô" />
          <AnimalNode animal={grandDam} relation="Avó" />
        </div>
      )}
    </div>
  );
}

function OffspringSection({ offspring = [] }) {
  const [showAll, setShowAll] = useState(false);
  const displayCount = showAll ? offspring.length : 6;

  if (offspring.length === 0) {
    return (
      <div className="offspring-section">
        <h4>Descendentes</h4>
        <div className="no-offspring">
          <FiUser size={24} />
          <span>Nenhum descendente registrado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="offspring-section">
      <div className="offspring-header">
        <h4>Descendentes ({offspring.length})</h4>
      </div>
      <div className="offspring-grid">
        {offspring.slice(0, displayCount).map((child) => (
          <AnimalNode
            key={child.id}
            animal={child}
            relation={child.sex === 'male' ? 'Filho' : 'Filha'}
          />
        ))}
      </div>
      {offspring.length > 6 && (
        <button
          className="show-more-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Mostrar menos' : `Ver todos (${offspring.length})`}
        </button>
      )}
    </div>
  );
}

export default function GenealogyTree({ genealogy, animal }) {
  if (!genealogy) {
    return (
      <div className="genealogy-tree-empty">
        <p>Dados genealógicos não disponíveis</p>
      </div>
    );
  }

  const { sire, dam, paternalGrandsire, paternalGranddam, maternalGrandsire, maternalGranddam, offspring } = genealogy;

  return (
    <div className="genealogy-tree">
      {/* Current Animal */}
      <div className="current-animal-section">
        <h4>Animal</h4>
        <div className="current-animal">
          <div className={`current-node ${animal?.sex === 'male' ? 'male' : 'female'}`}>
            <div className="node-avatar large">
              {animal?.photoUrl ? (
                <img src={animal.photoUrl} alt={animal.identifier} />
              ) : (
                <span>{animal?.identifier?.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="node-info">
              <span className="node-name large">{animal?.identifier}</span>
              {animal?.name && <span className="node-subname">{animal.name}</span>}
              <span className="node-breed">{animal?.species?.name} - {animal?.breed?.name}</span>
            </div>
            <div className={`node-sex-indicator ${animal?.sex}`}>
              {animal?.sex === 'male' ? '♂' : '♀'}
            </div>
          </div>
        </div>
      </div>

      {/* Parents Section */}
      <div className="parents-section">
        <ParentSection
          title="Linha Paterna"
          parent={sire}
          grandSire={paternalGrandsire}
          grandDam={paternalGranddam}
        />
        <div className="parents-divider" />
        <ParentSection
          title="Linha Materna"
          parent={dam}
          grandSire={maternalGrandsire}
          grandDam={maternalGranddam}
        />
      </div>

      {/* Offspring Section */}
      <OffspringSection offspring={offspring} />

      {/* Legend */}
      <div className="genealogy-legend">
        <div className="legend-item">
          <span className="legend-color male" />
          <span>Macho</span>
        </div>
        <div className="legend-item">
          <span className="legend-color female" />
          <span>Fêmea</span>
        </div>
        <div className="legend-item">
          <span className="legend-color unknown" />
          <span>Desconhecido</span>
        </div>
      </div>
    </div>
  );
}
