'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase クライアント初期化 ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- カテゴリの定義 ---
const CATEGORIES = [
  { value: 'gourmet', label: 'グルメ・飲食店' },
  { value: 'medical', label: '医療・クリニック' },
  { value: 'shopping', label: '買い物・ショップ' },
  { value: 'service', label: 'サービス・その他' }
];

// --- 型定義 ---
interface NeighborItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  address?: string;
  phone?: string;
  description?: string;
  mapUrl?: string;
}

export default function NeighborsPage() {
  const [items, setItems] = useState<NeighborItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    category: 'gourmet',
    address: '',
    phone: '',
    description: '',
    mapUrl: ''
  });

  // 初回読み込み（Supabaseからデータ取得）
  useEffect(() => {
    fetchNeighbors();
  }, []);

  const fetchNeighbors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;

      if (data) {
        const formatted: NeighborItem[] = data.map((item: any) => {
          const catObj = CATEGORIES.find((c) => c.value === item.goal);
          return {
            id: item.id,
            name: item.name || '名称不明',
            category: item.goal || 'service',
            categoryLabel: catObj ? catObj.label : 'その他',
            address: item.grade || '',
            description: item.source || '',
            phone: '',
            mapUrl: ''
          };
        });
        setItems(formatted);
      }
    } catch (err) {
      console.error('データ取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 追加処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const catObj = CATEGORIES.find((c) => c.value === formData.category);

    const newItem: NeighborItem = {
      id: `n-${Date.now()}`,
      categoryLabel: catObj ? catObj.label : 'その他',
      ...formData,
      mapUrl: formData.mapUrl || (formData.address ? `https://maps.google.com/?q=${encodeURIComponent(formData.address)}` : '')
    };

    try {
      // Supabaseに保存
      const { error } = await supabase.from('customers').insert([
        {
          name: formData.name,
          goal: formData.category,
          grade: formData.address,
          source: formData.description
        }
      ]);

      if (error) {
        alert('保存に失敗しました: ' + error.message);
        return;
      }

      alert('正常に保存されました！');
      setItems((prev) => [newItem, ...prev]);

      // フォームリセット
      setFormData({
        name: '',
        category: 'gourmet',
        address: '',
        phone: '',
        description: '',
        mapUrl: ''
      });
    } catch (err) {
      console.error('保存エラー:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>近隣情報管理</h1>

      {/* 登録フォーム */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>新規スポットの追加</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>名称:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>カテゴリ:</label>
          <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>住所:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>説明・メモ:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ backgroundColor: '#0070f3', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          保存する
        </button>
      </form>

      {/* 一覧表示 */}
      <h2>登録済みスポット一覧</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : items.length === 0 ? (
        <p>登録されているスポットはありません。</p>
      ) : (
        items.map((item) => (
          <div key={item.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            <span style={{ fontSize: '12px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '3px' }}>{item.categoryLabel}</span>
            <h3 style={{ margin: '5px 0' }}>{item.name}</h3>
            {item.address && <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>住所: {item.address}</p>}
            {item.description && <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{item.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}
