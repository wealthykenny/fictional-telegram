import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export function CertificateVerifyPage() {
  const { serial } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    apiFetch(`/.netlify/functions/certificate-verify?serial=${encodeURIComponent(serial)}`)
      .then((data) => setState({ loading: false, data, error: '' }))
      .catch((error) => setState({ loading: false, data: null, error: error.message }));
  }, [serial]);

  if (state.loading) return <p>Verifying parchment seal...</p>;
  if (state.error) return <p className="text-red-400">{state.error}</p>;

  return (
    <section className="parchment-panel max-w-2xl mx-auto">
      <h2 className="font-cinzel text-3xl text-royal">Certificate Verification</h2>
      <p className="mt-3">Serial: {state.data.certificate.serial_number}</p>
      <p>Holder: {state.data.certificate.real_name}</p>
      <p>Knight Title: {state.data.certificate.knight_title}</p>
      <p>Status: {state.data.certificate.status}</p>
    </section>
  );
}
