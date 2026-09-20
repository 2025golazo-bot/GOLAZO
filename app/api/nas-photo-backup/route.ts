import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const NAS_PHOTO_ROOT =
  process.env.NAS_PHOTO_ROOT ||
  '/Volumes/GOLAZO(アプリ)/files/golazo-photos';

function safePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');
    const clientId = String(formData.get('clientId') || '');
    const targetDate = String(formData.get('targetDate') || '');
    const photoType = String(formData.get('photoType') || '');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: '画像ファイルがありません。' },
        { status: 400 }
      );
    }

    if (!clientId || !targetDate || !photoType) {
      return NextResponse.json(
        { ok: false, error: '保存情報が不足しています。' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { ok: false, error: '画像ファイルのみ保存できます。' },
        { status: 400 }
      );
    }

    const extension =
      path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, '') || '.jpg';

    const directory = path.join(
      NAS_PHOTO_ROOT,
      safePart(clientId),
      safePart(targetDate),
      safePart(photoType)
    );

    await mkdir(directory, { recursive: true });

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const destination = path.join(directory, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(destination, Buffer.from(arrayBuffer));

    return NextResponse.json({
      ok: true,
      fileName,
    });
  } catch (error) {
    console.error('NAS写真バックアップエラー:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'NASへの写真保存に失敗しました。',
      },
      { status: 500 }
    );
  }
}
