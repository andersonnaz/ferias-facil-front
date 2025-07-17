import { useRef, useState, useCallback } from 'react';
import { NavBar } from './components/NavBar';
import './App.css';
import { GrLinkedin } from 'react-icons/gr';
import { MdEmail } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import { GoFileDirectoryFill } from 'react-icons/go';
import { RiFileExcel2Line } from 'react-icons/ri';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const allowed = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleClick = () => {
    inputRef.current?.click();
  };

  const syncInputFiles = useCallback((files: File[]) => {
    const input = inputRef.current;
    if (!input) return;

    const dt = new DataTransfer();
    Array.from(files).forEach((file) => dt.items.add(file));
    input.files = dt.files;
  }, []);

    const handleFiles = useCallback(
    (files: FileList) => {
      const validFiles = Array.from(files).filter((file) =>
        allowed.includes(file.type)
      );

      if (validFiles.length === 0) {
        alert('Envie apenas arquivos Excel (.xls ou .xlsx)');
        return;
      }

      if (validFiles.length > 1) {
        alert('Somente um arquivo será enviado. Usando o primeiro válido.');
      }

      const first = validFiles.slice(0, 1)
      setSelectedFiles(first as unknown as FileList);
      syncInputFiles(first);
    },
    [syncInputFiles]
  );

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if ((e.target as HTMLElement) === e.currentTarget) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
      e.dataTransfer.clearData();
    }
  };

  const getFilenameFromContentDisposition = (cd?: string | null): string | null => {
    if (!cd) return null;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(cd);
    if (!match) return null;
    let filename = match[1].trim();
    if (filename.startsWith('"') && filename.endsWith('"')) {
      filename = filename.slice(1, -1);
    }
    return filename;
  };

  const uploadFileToBackend = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Selecione ou arraste um arquivo primeiro!');
      return;
    }

    const file = selectedFiles[0];

    setUploadStatus('uploading');
    setUploadMessage('Enviando arquivo...');

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const resp = await fetch('https://feriasfacil-api.onrender.com/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const msg = `Erro no servidor (${resp.status})`;
        setUploadStatus('error');
        setUploadMessage(msg);
        return;
      }

      const blob = await resp.blob();

      const cd = resp.headers.get('Content-Disposition');
      const serverFilename = getFilenameFromContentDisposition(cd);
      const fallbackName = serverFilename || `ferias-facil-${Date.now()}.xlsx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fallbackName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setUploadStatus('success');
      setUploadMessage('Arquivo processado com sucesso! Download iniciado.');
    } catch (err) {
        console.error(err);
        setUploadStatus('error');
        setUploadMessage('Falha ao enviar arquivo. Verifique com o desenvolvedor.');
    }
  };

  return (
    <div className="items-start mx-auto mt-3 w-full max-w-[55rem] px-5 py-3">
      <header id="topo" className="flex items-center border-b border-[#C2C2C2] py-4 px-0 gap-4">
        <img src="/public/logoFeriasFacil.svg" className="h-12 w-auto" alt="Férias Fácil logo" />
        <NavBar />
      </header>

      <main className="mt-8 grid gap-[0.875rem] [&>*:last-child]:mb-[6.25rem] justify-center">
        <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50 rounded-xl p-5 gap-10">
          <div
            className={[
              "mt-8 w-[55vh] h-[40vh] border border-dashed flex flex-col items-center justify-center gap-4 p-4 bg-white text-center shadow-sm rounded transition-colors",
              isDragging ? "border-4 border-[#217346] bg-[#D9EAD3]/40" : "border-gray-300"
            ].join(" ")}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <RiFileExcel2Line size={40}/> 

            <p className="text-gray-700 text-sm px-2">
              {selectedFiles
                ? `Arquivo${selectedFiles.length > 1 ? "s" : ""} selecionado${selectedFiles.length > 1 ? "s" : ""}: ${Array.from(selectedFiles)
                    .map((file) => file.name)
                    .join(", ")}`
                : isDragging
                ? "Solte aqui…"
                : "Solte os arquivos aqui ou clique para enviar"}
            </p>

            <button
              type="button"
              onClick={handleClick}
              className="flex items-center gap-2 px-4 py-2 border bg-[#D9EAD3] border-gray-200 hover:bg-gray-100 text-sm rounded-xl"
            >
              Selecionar
            </button>

            <input
              type="file"
              multiple
              hidden
              ref={inputRef}
              accept=".xls,.xlsx"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files);
                }
              }}
            />
          </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={uploadStatus === 'uploading'}
                className={[
                  "p-3 w-[35vh] rounded-xl font-bold text-white transition-opacity",
                  uploadStatus === 'uploading' ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                  "bg-[#217346]"
                ].join(" ")}
                onClick={uploadFileToBackend}
              >
                {uploadStatus === 'uploading' ? 'Enviando...' : 'Enviar Arquivo'}
              </button>

              {uploadStatus !== 'idle' && (
                <p
                  className={
                    uploadStatus === 'error'
                      ? "text-red-600 text-sm"
                      : "text-gray-600 text-sm"
                  }
                >
                  {uploadMessage}
                </p>
              )}
            </div>
        </div>
      </main>
      <div id='tutorial' className="flex flex-col items-center  border-t border-[#C2C2C2] py-4 px-px gap-10">
        <div className='flex center-items gap-10'>
          <h1 className="text-gray-500 font-semibold py-10 px-2">
            Fique atento para que os dados estejam escritos corretamente,
            respeite todos os títulos das colunas, por exemplo:
            "graduacao", "ultimaPromocao", "opcao1".
          </h1>
          <img src="public/tabela.svg" className='w-120 h-45' />
        </div>
        <div>
          <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/Sdty5B8BP4k?si=Ikj_EFP2PpihLnsO" 
          title="YouTube video player"
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen>
          </iframe>
        </div>
      </div>
      <footer id='contato' className="flex flex-col border-t border-[#C2C2C2] py-4 px-px gap-1">
              <h1 className="text-gray-500 text-2xl px-0 py-2">Contato</h1>
              <div className='flex'>
                <GrLinkedin />
                <a href='https://www.linkedin.com/in/joseandersonsales/' className="text-gray-500 text-sm px-2"> @joseandersonsales</a>
              </div>
              <div className='flex'>
                <MdEmail />
                <a className="text-gray-500 text-sm px-2">anderson_1004@hotmail.com</a>
              </div>
              <div className='flex'>
                <FaGithub />
                <a href="https://github.com/andersonnaz" className="text-gray-500 text-sm px-2">@andersonnaz</a>
              </div>
              <div className='flex'>
              <GoFileDirectoryFill />
              <a href="https://github.com/andersonnaz/ferias-facil" className="text-gray-500 text-sm px-2">Repositório: @ferias-facil</a>
              </div>
          </footer>
    </div>
  );
}

export default App;
