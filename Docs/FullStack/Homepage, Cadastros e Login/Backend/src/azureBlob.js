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

export const enviarImagemParaBlob = async (fileBuffer, idLogin, originalName) => {
    try {
        const extensao = path.extname(originalName);
        const sysDate = formatarDataHora();
        const nomeArquivo = `${idLogin}_foto_${sysDate}${extensao}`;
        const blobPath = `${idLogin}/imagem/${nomeArquivo}`;

        const blobClient = containerClient.getBlockBlobClient(blobPath);

        await blobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: `image/${extensao.replace('.', '')}` }
        });

        console.log(`Imagem ${nomeArquivo} enviada com sucesso para o Azure Blob Storage.`);

        return blobClient.url;
        
    } catch (error) {
        console.error("Erro ao enviar imagem para o Blob Storage:", error);
        throw error;
    }
};

function formatarDataHora() {
    const data = new Date();

    const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '-');

    const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return `${dataFormatada} ${horaFormatada}`;
}