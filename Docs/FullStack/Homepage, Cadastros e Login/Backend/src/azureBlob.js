import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "usuarios";

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("ERRO: Azure Blob Storage variables.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);


export const enviarImagemParaBlob = async (fileBuffer, idLogin, originalName, subfolder = 'imagem') => {
    try {
        const extensao = path.extname(originalName);
        const sysDate = formatarDataHora();

        const nomeArquivo = `${idLogin}_${subfolder}_${sysDate}${extensao}`;
        const blobPath = `${idLogin}/${subfolder}/${nomeArquivo}`;

        const blobClient = containerClient.getBlockBlobClient(blobPath);

        await blobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: `image/${extensao.replace('.', '')}` }
        });

        return blobClient.url;

    } catch (error) {
        console.error("Erro ao enviar imagem para o Blob Storage:", error);
        throw error;
    }
};

function formatarDataHora() {
  const data = new Date();

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  const segundo = String(data.getSeconds()).padStart(2, '0');
  const ms = String(data.getMilliseconds()).padStart(3, '0');

  return `${dia}-${mes}-${ano}_${hora}-${minuto}-${segundo}-${ms}`;
}