'use client';
import React, { useState } from 'react';
import * as tus from 'tus-js-client';

export default function Home() {
  const [upload, setUpload] = useState();
  const [pause, setPause] = useState(false);

  const handleChange = eventObject => {
    const file = eventObject.target.files[0]

    // Create a new tus upload
    const initiateUpload = new tus.Upload(file, {
      // Endpoint is the upload creation URL from your tus server
      endpoint: 'http://localhost:8080/files/upload',
      chunkSize: 100000,
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [0, 3000, 5000],
      // Attach additional meta data about the file for the server
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      // Callback for errors which cannot be fixed using retries
      onError: function (error) {
        console.log('Failed because: ' + error)
      },
      // Callback for reporting upload progress
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        console.log(bytesUploaded, bytesTotal, percentage + '%')
      },
      // Callback for once the upload is completed
      onSuccess: function () {
        console.log('Download %s from %s', initiateUpload.file.name, initiateUpload.url)
      },
    })

    initiateUpload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        initiateUpload.resumeFromPreviousUpload(previousUploads[0])
      }

      // Start the upload
      initiateUpload.start()
    });

    setUpload(initiateUpload);
  }

  // Check if there are any previous uploads to continue.


  const handlePause = () => {
    upload.abort();
    setPause(true);
  };

  const handleResume = () => {
    upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }

      // Start the upload
      upload.start()
    });
    setPause(false);
  }

  const handleTerminate = async () => {
    console.log('url', upload.url);
    upload.abort();
    await tus.Upload.terminate(upload.url);
  }

  return (
    <>
      <div>upload test</div>
      <input onChange={handleChange} type='file' />
      {upload && <button type='submit' onClick={handlePause}>pause</button>}
      {pause && <button type='submit' onClick={handleResume}>resume</button>}
      {upload && <button type='submit' onClick={handleTerminate}>terminate</button>}
    </>
  )
}
