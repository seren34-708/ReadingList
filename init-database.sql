-- Reading Log Database Setup Script
-- このスクリプトはRDSインスタンスが作成された後に実行してください

-- テーブル作成
CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(50),
    url VARCHAR(1000),
    status VARCHAR(50) NOT NULL,
    rating VARCHAR(10),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成（パフォーマンス向上のため）
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- 更新日時自動更新のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ挿入（オプション）
INSERT INTO books (title, author, genre, status, rating, notes) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'novel', 'completed', '5', 'Classic American literature'),
    ('Atomic Habits', 'James Clear', 'self-help', 'reading', '', 'Great insights on habit formation');

-- テーブル確認
SELECT * FROM books;
