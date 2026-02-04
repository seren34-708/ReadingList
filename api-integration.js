// API統合ヘルパー関数
// このファイルをindex.htmlに統合するか、別ファイルとして読み込んでください

// API設定
const API_BASE_URL = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod';

// データをAPIから読み込み
async function loadBooksFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // データベースのカラム名をアプリ内の形式に変換
        return data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            genre: book.genre,
            url: book.url,
            status: book.status,
            rating: book.rating,
            startDate: book.start_date,
            endDate: book.end_date,
            notes: book.notes,
            createdAt: book.created_at
        }));
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        throw error;
    }
}

// 新しい本をAPIに保存
async function saveBooksToAPI(book) {
    try {
        const response = await fetch(`${API_BASE_URL}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: book.title,
                author: book.author,
                genre: book.genre,
                url: book.url,
                status: book.status,
                rating: book.rating,
                startDate: book.startDate,
                endDate: book.endDate,
                notes: book.notes
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            id: data.id,
            title: data.title,
            author: data.author,
            genre: data.genre,
            url: data.url,
            status: data.status,
            rating: data.rating,
            startDate: data.start_date,
            endDate: data.end_date,
            notes: data.notes,
            createdAt: data.created_at
        };
    } catch (error) {
        console.error('データ保存エラー:', error);
        throw error;
    }
}

// 本をAPIで更新
async function updateBookInAPI(id, book) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: book.title,
                author: book.author,
                genre: book.genre,
                url: book.url,
                status: book.status,
                rating: book.rating,
                startDate: book.startDate,
                endDate: book.endDate,
                notes: book.notes
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            id: data.id,
            title: data.title,
            author: data.author,
            genre: data.genre,
            url: data.url,
            status: data.status,
            rating: data.rating,
            startDate: data.start_date,
            endDate: data.end_date,
            notes: data.notes,
            createdAt: data.created_at
        };
    } catch (error) {
        console.error('データ更新エラー:', error);
        throw error;
    }
}

// 本をAPIから削除
async function deleteBookFromAPI(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok && response.status !== 204) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('データ削除エラー:', error);
        throw error;
    }
}

// 使用方法の例:
/*
// index.htmlのloadBooks関数を以下のように書き換え:
async function loadBooks() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        currentLanguage = savedLang;
    }
    updateUILanguage();

    try {
        books = await loadBooksFromAPI();
    } catch (error) {
        alert('データの読み込みに失敗しました。');
        books = [];
    }

    filterAndSortBooks();
    updateStats();
}

// フォーム送信を以下のように書き換え:
document.getElementById('bookForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        genre: document.getElementById('genre').value,
        url: document.getElementById('url').value,
        status: document.getElementById('status').value,
        rating: document.getElementById('rating').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        notes: document.getElementById('notes').value
    };

    try {
        const newBook = await saveBooksToAPI(bookData);
        books.unshift(newBook);
        filterAndSortBooks();
        updateStats();
        this.reset();
    } catch (error) {
        alert('データの保存に失敗しました。');
    }
});

// updateBook関数を以下のように書き換え:
async function updateBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const updatedData = {
        title: document.getElementById(`edit-title-${id}`).value,
        author: document.getElementById(`edit-author-${id}`).value,
        genre: document.getElementById(`edit-genre-${id}`).value,
        url: document.getElementById(`edit-url-${id}`).value,
        status: document.getElementById(`edit-status-${id}`).value,
        rating: document.getElementById(`edit-rating-${id}`).value,
        startDate: document.getElementById(`edit-startDate-${id}`).value,
        endDate: document.getElementById(`edit-endDate-${id}`).value,
        notes: document.getElementById(`edit-notes-${id}`).value
    };

    try {
        const updated = await updateBookInAPI(id, updatedData);
        const index = books.findIndex(b => b.id === id);
        if (index !== -1) {
            books[index] = updated;
        }
        editingBookId = null;
        filterAndSortBooks();
        updateStats();
    } catch (error) {
        alert('データの更新に失敗しました。');
    }
}

// deleteBook関数を以下のように書き換え:
async function deleteBook(id) {
    if (confirm('この記録を削除しますか？')) {
        try {
            await deleteBookFromAPI(id);
            books = books.filter(book => book.id !== id);
            filterAndSortBooks();
            updateStats();
        } catch (error) {
            alert('データの削除に失敗しました。');
        }
    }
}
*/
