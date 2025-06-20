// src/dicomImageLoaderConfig.js
import * as cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

export const configureCornerstoneWADOImageLoader = () => {
  // Required for cornerstone-wado-image-loader to work
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  // Configure web worker and codecs
  cornerstoneWADOImageLoader.webWorkerManager.initialize({
    webWorkerPath: '/cornerstoneWADOImageLoaderWebWorker.js',
    taskConfiguration: {
      decodeTask: {
        codecsPath: '/cornerstoneWADOImageLoaderCodecs.js',
      },
    },
  });
};
