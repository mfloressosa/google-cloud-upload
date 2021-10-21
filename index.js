// Importo libreria de google storage
const gcStorage = require("@google-cloud/storage");
const { Storage } = gcStorage;

// Importo librería logger
const log4js = require("log4js");

// Importo librería path
const path = require("path");

// Importo configuraciones
var LOGGER_CONFIG = require("./config/logger.config").LOGGER_CONFIG;

// Inicializo los logs
log4js.configure(LOGGER_CONFIG);
let logger = log4js.getLogger('GoogleCloudUpload');

// Datos para autenticación con GCS
let projectId = 'wom-ga-export';
let keyFilename = 'C:\\Users\\mflor\\Downloads\\wom-ga-export-72ff1d964e56.json';

// Datos para ejecución del upload en le bucket
let bucketName = 'convertia';
let filePath = 'C:\\Users\\mflor\\Downloads\\Prueba_Convertia_GCS.txt';
let destFileName = 'Prueba_Convertia_GCS.txt';

// Escribo a log
logger.info('/////////////////////////////');
logger.info('Iniciando procesamiento');

// Empiezo con promesa dummy para poder hacer throw y caer en el catch
Promise.resolve(true)
.then(
    result => {
        // Obtengo los argumentos recibidos
        let arg1 = (process.argv && process.argv[2] ? process.argv[2] : '');
        let arg2 = (process.argv && process.argv[3] ? process.argv[3] : '');
        let arg3 = (process.argv && process.argv[4] ? process.argv[4] : '');

        // Armo los datos del archivo a subir en función de argumentos recibidos
        filePath = path.resolve(arg1, arg2);
        destFileName = arg3 || arg2;

        // Controlo que estén los datos necesarios
        if (!filePath || !destFileName) throw 'No se recibieron los datos mínimos necesarios';

        // Escribo a log
        logger.info('Se subirá archivo \'' + filePath + '\' hacia el bucket \'' + bucketName + '\' con nombre \'' + destFileName + '\'.');

        // Inicializo el cliente usando el ID de proyecto y JSON con credenciales
        const storage = new Storage({
            projectId: projectId,
            keyFilename: keyFilename,
        });

        // Hago el upload hacia el bucket
        return storage.bucket(bucketName).upload(
            filePath,
            {
                destination: destFileName,
            }
        );
    }
).then(
    resultUpload => {
        // Escribo a log
        logger.info('El archivo \'' + filePath + '\' se subió correctamente a google cloud storage.');

        // Escribo a log
        logger.info('Proceso finalizado correctamente');
        logger.info('//////////////////////////////////////');

        // Todo OK, sigo
        return true;
    }
).catch(
    (err) => {
        // Obtengo mensajes de error
        let errorMsg = (typeof err === 'string' ? err : err.message || err.description || 'Error al ejecutar solicitud');

        // Escribo el error en el log
        logger.error('Se produjo un error al ejecutar la tarea:');
        logger.error(errorMsg);

        // Escribo a log
        logger.info('Proceso finalizado con errores');
        logger.info('////////////////////////////////////');

        // Lanzo el error para que se controle desde fuera
        return Promise.resolve(null);
    }
);
