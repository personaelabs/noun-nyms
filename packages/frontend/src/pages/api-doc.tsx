import dynamic from 'next/dynamic';
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

const ApiDoc = () => <SwaggerUI url="/api-doc.yml" />;

export default ApiDoc;
