import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "usuarios";

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("ERRO: Azure Blob Storage variables.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);


export const enviarParaBlob = async (dados, nomeArquivo) => {
    try {

        const blobClient = containerClient.getBlockBlobClient(nomeArquivo);
        const jsonData = JSON.stringify(dados, null, 2);

        await blobClient.upload(jsonData, Buffer.byteLength(jsonData), {
            blobHTTPHeaders: { blobContentType: "application/json" }
        });

        console.log(`Arquivo ${nomeArquivo} enviado com sucesso para o Azure Blob Storage.`);
        
    } catch (error) {
        console.error("Erro ao enviar arquivo para o Blob Storage:", error);
        throw error;
    }
};
