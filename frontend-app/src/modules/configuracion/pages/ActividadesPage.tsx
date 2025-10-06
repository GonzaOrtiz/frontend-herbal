import React, { useState } from 'react';
import ConfigNavBar from '../components/ConfigNavBar';
import ConfigBreadcrumbs from '../components/ConfigBreadcrumbs';
import CatalogTable from '../components/CatalogTable';
import FormSection from '../components/FormSection';

// Datos mock para la tabla
const rows = [
	{ id: 1, nombre: 'Actividad 1', estado: 'activo' },
	{ id: 2, nombre: 'Actividad 2', estado: 'inactivo' },
];
const columns = [
	{ field: 'id', headerName: 'ID', width: 90 },
	{ field: 'nombre', headerName: 'Nombre', width: 200 },
	{ field: 'estado', headerName: 'Estado', width: 130 },
];

const ActividadesPage: React.FC = () => {
	const [nombre, setNombre] = useState('');
	return (
		<>
			<ConfigBreadcrumbs />
			<ConfigNavBar />
			<FormSection title="Agregar Actividad">
				<form>
					<input
						type="text"
						placeholder="Nombre"
						value={nombre}
						onChange={e => setNombre(e.target.value)}
					/>
					<button type="submit">Guardar</button>
				</form>
			</FormSection>
			<CatalogTable rows={rows} columns={columns} />
		</>
	);
};

export default ActividadesPage;
