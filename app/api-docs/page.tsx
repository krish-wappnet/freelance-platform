'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    async function fetchSpec() {
      const response = await fetch('/api/swagger');
      const data = await response.json();
      setSpec(data);
    }
    fetchSpec();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-muted-foreground">Loading API documentation...</p>
        </div>
      )}
    </div>
  );
}