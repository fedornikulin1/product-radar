import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminToken } from '@/utils/auth';

const imageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const documentTypes = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
  'application/octet-stream',
];

function getExtension(fileName: string) {
  return fileName.toLowerCase().split('.').pop() || '';
}

function isImageFile(file: File) {
  const ext = getExtension(file.name);
  return imageTypes.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
}

function isPresentationFile(file: File) {
  const ext = getExtension(file.name);

  return (
    documentTypes.includes(file.type) ||
    ['pdf', 'ppt', 'pptx', 'odp', 'key'].includes(ext)
  );
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'Файл не найден' },
      { status: 400 },
    );
  }

  const isImage = isImageFile(file);
  const isPresentation = isPresentationFile(file);

  if (!isImage && !isPresentation) {
    return NextResponse.json(
      { error: 'Поддерживаются только изображения и файлы PDF/PPT/PPTX/ODP/KEY' },
      { status: 400 },
    );
  }

  const maxSize = isPresentation ? 25 * 1024 * 1024 : 10 * 1024 * 1024;

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `Файл слишком большой. Максимум ${isPresentation ? '25MB' : '10MB'}` },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = getExtension(file.name) || (isPresentation ? 'pdf' : 'png');
  const fileName = `${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadDir, { recursive: true });

  const savedFilePath = path.join(uploadDir, fileName);
  await fs.writeFile(savedFilePath, buffer);

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}