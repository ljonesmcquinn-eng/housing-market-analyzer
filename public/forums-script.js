// Global state
let currentUser = null;
let currentCategory = null;
let currentThread = null;

// Check authentication status on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                currentUser = data.user;
                document.getElementById('authButtons').style.display = 'none';
                document.getElementById('userMenu').style.display = 'flex';
                document.getElementById('usernameDisplay').textContent = data.user.username;
            }
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/forums.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Load and display categories
async function loadCategories() {
    try {
        const response = await fetch('/api/forum/categories');
        const data = await response.json();

        if (data.success) {
            const categoriesList = document.getElementById('categoriesList');
            categoriesList.innerHTML = '';

            data.categories.forEach(category => {
                const card = document.createElement('div');
                card.className = 'category-card';
                card.onclick = () => showCategory(category.id, category.name, category.description);

                card.innerHTML = `
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-name">${category.name}</div>
                    <div class="category-description">${category.description}</div>
                    <div class="category-stats">
                        <span>${category.thread_count} threads</span>
                        <span>${category.post_count} posts</span>
                    </div>
                `;

                categoriesList.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Show category with threads
async function showCategory(categoryId, name, description) {
    currentCategory = categoryId;

    document.getElementById('categoriesView').style.display = 'none';
    document.getElementById('categoryView').style.display = 'block';
    document.getElementById('categoryTitle').textContent = name;
    document.getElementById('categoryDescription').textContent = description;

    // Show create thread button only if logged in
    if (currentUser) {
        document.getElementById('createThreadSection').style.display = 'block';
    } else {
        document.getElementById('createThreadSection').style.display = 'none';
    }

    await loadThreads(categoryId);
}

// Load threads in category
async function loadThreads(categoryId) {
    try {
        const response = await fetch(`/api/forum/categories/${categoryId}/threads`);
        const data = await response.json();

        if (data.success) {
            const threadsList = document.getElementById('threadsList');

            if (data.threads.length === 0) {
                threadsList.innerHTML = '<div class="login-prompt"><p>No threads yet. Be the first to start a discussion!</p></div>';
                return;
            }

            threadsList.innerHTML = '';

            data.threads.forEach(thread => {
                const card = document.createElement('div');
                card.className = 'thread-card';
                card.onclick = () => showThread(thread.id);

                const lastReply = thread.last_reply_at ? new Date(thread.last_reply_at).toLocaleDateString() : 'No replies yet';

                card.innerHTML = `
                    <div class="thread-card-title">${thread.title}</div>
                    <div class="thread-card-meta">
                        <span>By ${thread.author}</span>
                        <span>${thread.reply_count} replies</span>
                        <span>${thread.view_count} views</span>
                        <span>Last: ${lastReply}</span>
                    </div>
                `;

                threadsList.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading threads:', error);
    }
}

// Show thread with posts
async function showThread(threadId) {
    currentThread = threadId;

    try {
        const response = await fetch(`/api/forum/threads/${threadId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('categoryView').style.display = 'none';
            document.getElementById('threadView').style.display = 'block';
            document.getElementById('threadTitle').textContent = data.thread.title;
            document.getElementById('threadAuthor').textContent = `By ${data.thread.author}`;
            document.getElementById('threadDate').textContent = new Date(data.thread.created_at).toLocaleDateString();

            // Show reply section only if logged in and thread not locked
            if (currentUser && !data.thread.is_locked) {
                document.getElementById('replySection').style.display = 'block';
            } else if (!currentUser) {
                const replySection = document.getElementById('replySection');
                replySection.style.display = 'block';
                replySection.innerHTML = `
                    <div class="login-prompt">
                        <p>Please log in to reply to this thread</p>
                        <a href="/login.html" class="btn-primary">Log In</a>
                    </div>
                `;
            }

            // Display posts
            const postsList = document.getElementById('postsList');
            postsList.innerHTML = '';

            data.posts.forEach((post, index) => {
                const postCard = document.createElement('div');
                postCard.className = 'post-card';

                const isFirstPost = index === 0;
                const postDate = new Date(post.created_at).toLocaleString();

                postCard.innerHTML = `
                    <div class="post-header">
                        <div>
                            <div class="post-author">${post.author}${isFirstPost ? ' (OP)' : ''}</div>
                        </div>
                        <div class="post-date">${postDate}</div>
                    </div>
                    <div class="post-content">${escapeHtml(post.content)}</div>
                `;

                postsList.appendChild(postCard);
            });
        }
    } catch (error) {
        console.error('Error loading thread:', error);
    }
}

// Toggle new thread form
function toggleNewThread() {
    const form = document.getElementById('newThreadForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        document.getElementById('threadTitle').value = '';
        document.getElementById('threadContent').value = '';
        document.getElementById('threadError').style.display = 'none';
    } else {
        form.style.display = 'none';
    }
}

// Create new thread
async function createThread() {
    const title = document.getElementById('threadTitle').value.trim();
    const content = document.getElementById('threadContent').value.trim();
    const errorDiv = document.getElementById('threadError');

    errorDiv.style.display = 'none';

    if (!title || !content) {
        errorDiv.textContent = 'Please fill in both title and content';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/forum/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                categoryId: currentCategory,
                title,
                content
            })
        });

        const data = await response.json();

        if (data.success) {
            toggleNewThread();
            await loadThreads(currentCategory);
            showThread(data.threadId);
        } else {
            errorDiv.textContent = data.error || 'Failed to create thread';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error creating thread:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Create reply
async function createReply() {
    const content = document.getElementById('replyContent').value.trim();
    const errorDiv = document.getElementById('replyError');

    errorDiv.style.display = 'none';

    if (!content) {
        errorDiv.textContent = 'Please enter a reply';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/forum/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                threadId: currentThread,
                content
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('replyContent').value = '';
            await showThread(currentThread);
        } else {
            errorDiv.textContent = data.error || 'Failed to post reply';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error posting reply:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Navigation functions
function showCategories() {
    document.getElementById('categoriesView').style.display = 'block';
    document.getElementById('categoryView').style.display = 'none';
    document.getElementById('threadView').style.display = 'none';
    document.getElementById('newThreadForm').style.display = 'none';
    loadCategories();
}

function backToCategory() {
    document.getElementById('threadView').style.display = 'none';
    document.getElementById('categoryView').style.display = 'block';
    loadThreads(currentCategory);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCategories();
});
