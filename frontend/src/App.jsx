import { useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { apiFetch } from './lib/api';

const MODEL_OPTIONS = [
  {
    value: 'fazon-realistic-pro',
    label: 'Fazon Realistic Pro',
    supportsImageInput: true,
    description: 'Ultra-realistic Gemini Flash Image flow for text + image input.',
    aspectRatios: ['1:1', '2:3', '4:5', '9:16', '16:9']
  },
  {
    value: 'fazon-photography',
    label: 'Fazon Photography',
    supportsImageInput: false,
    description: 'Aesthetic, editorial photo generation from text only.',
    aspectRatios: ['1:1', '2:3', '4:5', '9:16', '16:9']
  },
  {
    value: 'nano-banana-pro',
    label: 'Nano Banana Pro',
    supportsImageInput: true,
    description: 'General image generation + editing from local image input.',
    aspectRatios: ['1:1', '2:3', '4:5', '9:16', '16:9']
  }
];

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

function downloadImage(url, name) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.target = '_blank';
  anchor.rel = 'noreferrer';
  anchor.click();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('A premium sneaker on thick liquid glass, studio orange and white lighting, ultra realistic.');
  const [styleNotes, setStyleNotes] = useState('High contrast, clean edges, premium product photography.');
  const [referenceImageDataUrl, setReferenceImageDataUrl] = useState('');
  const [referencePreview, setReferencePreview] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [status, setStatus] = useState('Ready.');
  const [drafts, setDrafts] = useState([]);
  const [referralLabel, setReferralLabel] = useState('');
  const [referralUrl, setReferralUrl] = useState('');
  const [referralLinks, setReferralLinks] = useState([]);

  const selectedModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.value === model) || MODEL_OPTIONS[0],
    [model]
  );

  useEffect(() => {
    apiFetch('/.netlify/functions/save-draft').then((res) => setDrafts(res.drafts || [])).catch(() => null);
    apiFetch('/.netlify/functions/referral-links').then((res) => setReferralLinks(res.links || [])).catch(() => null);
  }, []);

  const handleReferenceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setReferenceImageDataUrl(dataUrl);
    setReferencePreview(dataUrl);
    setStatus(`Loaded local reference image: ${file.name}`);
  };

  const loginAdmin = async () => {
    try {
      await apiFetch('/.netlify/functions/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      setStatus('Admin authenticated.');
    } catch {
      setStatus('Admin login failed.');
    }
  };

  const generateImage = async () => {
    try {
      setStatus('Generating image...');
      const response = await apiFetch('/.netlify/functions/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          model,
          prompt,
          styleNotes,
          aspectRatio,
          referenceImage: selectedModel.supportsImageInput ? referenceImageDataUrl : ''
        })
      });
      setResultImage(response.imageUrl || PLACEHOLDER_IMAGE);
      setStatus(response.message || 'Image generated.');
    } catch {
      setResultImage(PLACEHOLDER_IMAGE);
      setStatus('Generation service fallback loaded. Check secrets and API keys.');
    }
  };

  const saveDraft = async () => {
    if (!resultImage) return;
    const draft = {
      id: crypto.randomUUID(),
      imageUrl: resultImage,
      model,
      prompt,
      styleNotes,
      createdAt: new Date().toISOString()
    };

    setDrafts((current) => [draft, ...current]);
    setStatus('Draft saved temporarily.');

    try {
      await apiFetch('/.netlify/functions/save-draft', { method: 'POST', body: JSON.stringify(draft) });
    } catch {
      // local-first draft UX
    }
  };

  const deleteDraft = async (id) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
    setStatus('Draft deleted.');
    try {
      await apiFetch(`/.netlify/functions/delete-draft?id=${id}`, { method: 'DELETE' });
    } catch {
      // local-first draft UX
    }
  };

  const saveToProfile = async () => {
    if (!resultImage) return;
    await apiFetch('/.netlify/functions/save-final', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: resultImage, model, prompt, styleNotes })
    }).catch(() => null);
    setStatus('Saved to account profile.');
  };

  const addReferralLink = async () => {
    if (!referralLabel || !referralUrl) return;
    try {
      const res = await apiFetch('/.netlify/functions/referral-links', {
        method: 'POST',
        body: JSON.stringify({ label: referralLabel, url: referralUrl })
      });
      setReferralLinks((current) => [res.referral, ...current]);
      setReferralLabel('');
      setReferralUrl('');
      setStatus('Referral link saved.');
    } catch {
      setStatus('Could not save referral link.');
    }
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <main className="app-shell">
      <header className="glass-panel top-panel">
        <div>
          <h1>Flex4Genz</h1>
          <p>Netlify + AWS storage/database image studio with thick liquid glass UI.</p>
        </div>
      </header>

      <section className="glass-panel">
        <h2>Admin Login (No Signup)</h2>
        <div className="stack-mobile">
          <input value={adminUsername} onChange={(event) => setAdminUsername(event.target.value)} placeholder="Admin username" />
          <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Admin password" />
          <button className="solid-btn" onClick={loginAdmin}>Admin Login</button>
        </div>
      </section>

      <section className="glass-panel">
        <h2>Generate Image</h2>
        <p className="small-note">{selectedModel.description}</p>

        <div className="input-grid">
          <label>
            Type your main prompt
            <textarea rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </label>

          <label>
            Additional text instructions
            <textarea rows={4} value={styleNotes} onChange={(event) => setStyleNotes(event.target.value)} />
          </label>

          <label>
            Model
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <div>
            <span className="input-title">Aspect ratio</span>
            <div className="ratio-grid">
              {selectedModel.aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  className={ratio === aspectRatio ? 'ratio-btn active' : 'ratio-btn'}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <label>
            Upload local reference image
            <input
              type="file"
              accept="image/*"
              onChange={handleReferenceFile}
              disabled={!selectedModel.supportsImageInput}
            />
          </label>
        </div>

        {referencePreview && selectedModel.supportsImageInput && (
          <div className="reference-preview">
            <img src={referencePreview} alt="Reference" />
          </div>
        )}

        <div className="actions">
          <button className="solid-btn" onClick={generateImage}>Generate</button>
          <button className="solid-btn" onClick={saveDraft} disabled={!resultImage}>Save Temporarily</button>
          <button className="solid-btn" onClick={saveToProfile} disabled={!resultImage}>Save to Account Profile</button>
          <button className="solid-btn" onClick={() => resultImage && downloadImage(resultImage, 'flex4genz-output.png')} disabled={!resultImage}>
            Save to Device
          </button>
        </div>

        <p className="status-text">{status}</p>
      </section>

      <section className="glass-panel">
        <h2>Generated Output</h2>
        <div className="preview-frame">
          {resultImage ? <img src={resultImage} alt="Generated output" /> : <p>No image generated yet.</p>}
        </div>
      </section>

      <section className="glass-panel">
        <h2>Temporary Saves</h2>
        <div className="draft-grid">
          {drafts.length === 0 && <p>No saved drafts yet.</p>}
          {drafts.map((draft) => (
            <article key={draft.id} className="draft-card">
              <img src={draft.imageUrl} alt={draft.prompt} />
              <p>{draft.model}</p>
              <div className="draft-actions">
                <button className="small-btn" onClick={() => setResultImage(draft.imageUrl)}>Display</button>
                <button className="small-btn danger" onClick={() => deleteDraft(draft.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel">
        <h2>Admin Referral Links</h2>
        <div className="stack-mobile">
          <input value={referralLabel} onChange={(event) => setReferralLabel(event.target.value)} placeholder="Referral label" />
          <input value={referralUrl} onChange={(event) => setReferralUrl(event.target.value)} placeholder="https://example.com/ref" />
          <button className="solid-btn" onClick={addReferralLink}>Add Referral Link</button>
        </div>
        <ul className="referral-list">
          {referralLinks.map((link) => (
            <li key={link.id}><strong>{link.label}</strong>: {link.url}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
