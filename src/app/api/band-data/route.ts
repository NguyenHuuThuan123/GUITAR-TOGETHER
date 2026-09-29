import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MOCK_SONGS, MOCK_SETLISTS, MOCK_BAND } from '@/lib/mock-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'band-data.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      songs: MOCK_SONGS,
      setlists: MOCK_SETLISTS,
      currentBand: MOCK_BAND,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc file dữ liệu band-data.json:', err);
    return {
      songs: MOCK_SONGS,
      setlists: MOCK_SETLISTS,
      currentBand: MOCK_BAND,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function GET() {
  try {
    const data = ensureDataFile();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi API GET /api/band-data:', error);
    return NextResponse.json({ error: 'Không thể đọc dữ liệu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    ensureDataFile();

    const currentData = ensureDataFile();
    const updatedData = {
      songs: body.songs ?? currentData.songs,
      setlists: body.setlists ?? currentData.setlists,
      currentBand: body.currentBand ?? currentData.currentBand,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, lastUpdated: updatedData.lastUpdated });
  } catch (error) {
    console.error('Lỗi API POST /api/band-data:', error);
    return NextResponse.json({ error: 'Không thể lưu dữ liệu' }, { status: 500 });
  }
}
