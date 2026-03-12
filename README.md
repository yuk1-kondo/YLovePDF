# YLovePDF

Privacy-first PDF toolkit built with Next.js App Router and TypeScript.

## Features

- Merge PDF
- Split PDF
- Rotate PDF
- PDF to Image
- Image to PDF
- Compress PDF (light optimization)

## Privacy and Security

- Browser-only processing
- No API routes
- No file uploads to servers
- Files are processed in memory and downloaded locally

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- TailwindCSS
- pdf-lib
- pdfjs-dist
- react-dropzone
- file-saver

## Development

Install dependencies:

npm install

Run local development:

npm run dev

Open:

[http://localhost:3000](http://localhost:3000)

## Build (Static Export)

npm run build

This project is configured with output: export and can be deployed on Cloudflare Pages or Vercel static hosting.

## Project Structure

- app
- components
- lib/pdf
- utils
- workers
