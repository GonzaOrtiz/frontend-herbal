import React from 'react';
import ConfigNavBar from '../components/ConfigNavBar';
import ConfigBreadcrumbs from '../components/ConfigBreadcrumbs';

const EmpleadosPage: React.FC = () => (
	<>
		<ConfigBreadcrumbs />
		<ConfigNavBar />
		<div>Empleados</div>
	</>
);

export default EmpleadosPage;
