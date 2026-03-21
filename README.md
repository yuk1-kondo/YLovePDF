# YLovePDF

Privacy-first PDF toolkit built with Next.js App Router and TypeScript.

## Features

- Merge PDF
- Split PDF
- Rotate PDF
- PDF to Image
- Image to PDF
- Compress PDF (light optimization)
- Add Watermark (text watermark on all pages)
- Page Numbers (insert page numbers)
- Extract Pages (pick specific pages into a new PDF)
- Edit Metadata (title, author, subject, keywords)

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

Node version:

Requires **Node.js >= 20.9.0** (same as [Next.js](https://nextjs.org)).

For reproducible installs, the repo includes `.nvmrc` (e.g. `20.20.1`). With nvm:

`nvm use`

Verify:

`node -v` should be v20.9+ (or match `.nvmrc` if you use it).

Install dependencies:

npm install

Run local development:

npm run dev

Open:

[http://localhost:3000](http://localhost:3000)

## Build (Static Export)

npm run build

Note: `predev` / `prebuild` / `pretest` run a version check (`>= 20.9.0`, aligned with Next.js).

After `npm install`, `postinstall` removes stray duplicate folders under `node_modules/@types/* 2` (e.g. from Finder “Copy”) that can break TypeScript with errors like `Cannot find type definition file for 'aria-query 2'`.

This project is configured with output: export and can be deployed on Cloudflare Pages or Vercel static hosting.

## Project Structure

- app
- components
- lib/pdf
- utils
- workers
