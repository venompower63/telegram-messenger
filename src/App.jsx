import { useState, useEffect, useRef } from "react";
import {
	MoreVertical,
	Paperclip,
	Send,
	Smile,
	Check,
	CheckCheck,
	ArrowLeft,
	Phone,
	Video,
	Image,
	Music,
	FileText,
	Camera,
	Plus,
	Users,
	Settings,
	Play,
	Heart,
	X,
	Lock,
	UserPlus,
	MessageCircle,
	Search,
} from "lucide-react";
import "./App.css";

const API_BASE = "/api";
const TOKEN_KEY = "messenger_token";

function formatTime(dateStr) {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
	if (diffDays === 0)
		return date.toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit",
		});
	if (diffDays === 1) return "вчера";
	if (diffDays < 7)
		return date.toLocaleDateString("ru-RU", { weekday: "short" });
	return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatMessageTime(dateStr) {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	return date.toLocaleTimeString("ru-RU", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatOnlineStatus(status, lastSeen) {
	if (status === "online") return "онлайн";
	if (!lastSeen) return "был(а) давно";
	const date = new Date(lastSeen);
	const now = new Date();
	const diffMins = Math.floor((now - date) / (1000 * 60));
	if (diffMins < 60) return `был(а) ${diffMins} мин. назад`;
	if (diffMins < 1440) return `был(а) ${Math.floor(diffMins / 60)} ч. назад`;
	return `был(а) ${Math.floor(diffMins / 1440)} дн. назад`;
}

function formatNumber(num) {
	if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
	if (num >= 1000) return (num / 1000).toFixed(1) + "K";
	return num.toString();
}

function StatusIcon({ status }) {
	if (status === "read")
		return <CheckCheck size={14} className="status-icon read" />;
	if (status === "delivered" || status === "sent")
		return <Check size={14} className="status-icon sent" />;
	return null;
}

function Avatar({ src, name, isOnline, size = 48 }) {
	return (
		<div className={`avatar avatar-${size}`} style={{ position: "relative" }}>
			<img src={src} alt={name} />
			{isOnline && <div className="online-indicator" />}
		</div>
	);
}

function EmptyChat() {
	return (
		<div className="empty-chat">
			<div className="empty-icon">
				<MessageCircle size={64} />
			</div>
			<h2>Выберите чат</h2>
			<p>Выберите контакт из списка слева или добавьте новый</p>
		</div>
	);
}

function MessageBubble({ message, isOutgoing }) {
	return (
		<div className={`message-bubble ${isOutgoing ? "outgoing" : "incoming"}`}>
			<div className="message-content">{message.text}</div>
			{message.attachment && (
				<div
					className={`message-attachment attachment-${message.attachment.type}`}
				>
					{message.attachment.type === "image" && (
						<img
							src={message.attachment.url}
							alt={message.attachment.filename}
						/>
					)}
					{message.attachment.type === "document" && (
						<div className="document-preview">
							<FileText size={20} />
							<span className="document-name">
								{message.attachment.filename}
							</span>
						</div>
					)}
				</div>
			)}
			<div className="message-meta">
				<span className="message-time">
					{formatMessageTime(message.timestamp)}
				</span>
				{isOutgoing && <StatusIcon status={message.status} />}
			</div>
		</div>
	);
}

function ChatHeader({ chat, onBack }) {
	return (
		<div className="chat-header">
			<button className="back-button" onClick={onBack}>
				<ArrowLeft size={20} />
			</button>
			<Avatar
				src={chat.avatar}
				name={chat.name}
				isOnline={chat.isOnline}
				size={40}
			/>
			<div className="chat-header-info">
				<span className="chat-header-name">{chat.name}</span>
				<span className="chat-header-status">
					{chat.isOnline ? "онлайн" : formatOnlineStatus(null, chat.lastSeen)}
				</span>
			</div>
			<div className="chat-header-actions">
				<button className="action-btn">
					<Phone size={20} />
				</button>
				<button className="action-btn">
					<Video size={20} />
				</button>
				<button className="action-btn">
					<MoreVertical size={20} />
				</button>
			</div>
		</div>
	);
}

function MessageInput({ onSend, disabled }) {
	const [text, setText] = useState("");
	const fileInputRef = useRef(null);

	const handleSend = () => {
		if (text.trim()) {
			onSend(text.trim(), null, null);
			setText("");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="message-input-container">
			<button
				className="action-btn"
				onClick={() => fileInputRef.current?.click()}
			>
				<Paperclip size={20} />
			</button>
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				accept="image/*,video/*,audio/*"
			/>
			<input
				type="text"
				className="message-input"
				placeholder="Сообщение..."
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={handleKeyDown}
				disabled={disabled}
			/>
			<button className="action-btn">
				<Smile size={20} />
			</button>
			<button
				className="send-btn"
				onClick={handleSend}
				disabled={!text.trim() || disabled}
			>
				<Send size={20} />
			</button>
		</div>
	);
}

function ChatListItem({ chat, isActive, onClick }) {
	return (
		<div
			className={`chat-list-item ${isActive ? "active" : ""}`}
			onClick={onClick}
		>
			<Avatar src={chat.avatar} name={chat.name} isOnline={chat.isOnline} />
			<div className="chat-info">
				<div className="chat-header-row">
					<span className="chat-name">{chat.name}</span>
					{chat.lastMessage && (
						<span className="chat-time">
							{formatTime(chat.lastMessage.timestamp)}
						</span>
					)}
				</div>
				<div className="chat-preview-row">
					<span className="chat-preview">
						{chat.lastMessage?.text || "Нет сообщений"}
					</span>
					{chat.unreadCount > 0 && (
						<span className="unread-badge">
							{chat.unreadCount > 99 ? "99+" : chat.unreadCount}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

function ChannelListItem({ channel, onClick }) {
	return (
		<div className="channel-list-item" onClick={onClick}>
			<Avatar
				src={channel.avatar}
				name={channel.name}
				isOnline={false}
				size={40}
			/>
			<div className="channel-info">
				<div className="channel-header-row">
					<span className="channel-name">
						{channel.isPrivate && <Lock size={12} />}
						{channel.name}
					</span>
				</div>
				<div className="channel-members">
					<Users size={12} />
					{formatNumber(channel.members)}
				</div>
			</div>
			{channel.subscribed && <span className="subscribed-badge">✓</span>}
		</div>
	);
}

// ============ NEW MODALS ============

function AuthModal({ onAuth }) {
	const [isLogin, setIsLogin] = useState(true);
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
			const body = isLogin ? { phone } : { phone, name, bio };

			const res = await fetch(`${API_BASE}${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.detail || "Ошибка авторизации");
				return;
			}

			localStorage.setItem(TOKEN_KEY, data.token);
			onAuth(data.user);
		} catch (err) {
			setError("Ошибка соединения");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content auth-modal">
				<div className="auth-header">
					<img
						src="https://api.dicebear.com/7.x/initials/svg?seed=M"
						alt="Logo"
						className="auth-logo"
					/>
					<h1>Telegram</h1>
					<p>Введите номер телефона для входа</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Телефон</label>
						<input
							type="tel"
							placeholder="+79001234567"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							required
						/>
					</div>

					{!isLogin && (
						<>
							<div className="form-group">
								<label>Ваше имя</label>
								<input
									type="text"
									placeholder="Иван Иванов"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="form-group">
								<label>О себе (необязательно)</label>
								<input
									type="text"
									placeholder="Расскажите о себе"
									value={bio}
									onChange={(e) => setBio(e.target.value)}
								/>
							</div>
						</>
					)}

					{error && <div className="error-message">{error}</div>}

					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
					</button>
				</form>

				<div className="auth-toggle">
					{isLogin ? (
						<p>
							Нет аккаунта?{" "}
							<button onClick={() => setIsLogin(false)}>
								Зарегистрироваться
							</button>
						</p>
					) : (
						<p>
							Уже есть аккаунт?{" "}
							<button onClick={() => setIsLogin(true)}>Войти</button>
						</p>
					)}
				</div>

				<div className="demo-hint">
					<p>Для демо используйте телефон:</p>
					<code>+79001234567</code>
				</div>
			</div>
		</div>
	);
}

function ContactsModal({ onClose, onAddContact }) {
	const [suggestions, setSuggestions] = useState([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchSuggestions();
	}, []);

	const fetchSuggestions = async () => {
		try {
			const token = localStorage.getItem(TOKEN_KEY);
			const res = await fetch(`${API_BASE}/contacts/suggestions`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			setSuggestions(data);
		} catch (err) {
			console.error("Failed to fetch suggestions:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = async (userId) => {
		const token = localStorage.getItem(TOKEN_KEY);
		try {
			const res = await fetch(`${API_BASE}/contacts/${userId}`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok) {
				onAddContact(data.chat);
				setSuggestions(suggestions.filter((s) => s.id !== userId));
			}
		} catch (err) {
			console.error("Failed to add contact:", err);
		}
	};

	const filtered = suggestions.filter(
		(s) =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.phone.includes(search),
	);

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content contacts-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>Добавить контакт</h2>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<div className="search-container">
					<Search size={18} />
					<input
						type="text"
						placeholder="Поиск по имени или телефону..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="contacts-list">
					{loading ? (
						<div className="loading">Загрузка...</div>
					) : filtered.length === 0 ? (
						<div className="no-contacts">Контакты не найдены</div>
					) : (
						filtered.map((user) => (
							<div key={user.id} className="contact-item">
								<Avatar
									src={user.avatar}
									name={user.name}
									isOnline={user.status === "online"}
									size={48}
								/>
								<div className="contact-info">
									<span className="contact-name">{user.name}</span>
									<span className="contact-phone">{user.phone}</span>
									<span className="contact-bio">{user.bio}</span>
								</div>
								<button
									className="add-contact-btn"
									onClick={() => handleAdd(user.id)}
								>
									<UserPlus size={20} />
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

function ProfileSettings({ profile, onClose, onUpdate, onLogout }) {
	const [name, setName] = useState(profile?.name || "");
	const [bio, setBio] = useState(profile?.bio || "");
	const [status, setStatus] = useState(profile?.status || "online");

	const handleSave = () => {
		onUpdate({ name, bio, status });
	};

	const handleLogout = () => {
		localStorage.removeItem(TOKEN_KEY);
		onLogout();
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content profile-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>Настройки</h2>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div className="modal-body">
					<div className="profile-avatar-edit">
						<img src={profile?.avatar} alt={profile?.name} />
					</div>

					<div className="form-group">
						<label>Имя</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="form-group">
						<label>Телефон</label>
						<input type="text" value={profile?.phone || ""} disabled />
					</div>

					<div className="form-group">
						<label>О себе</label>
						<input
							type="text"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							placeholder="Расскажите о себе"
						/>
					</div>

					<div className="form-group">
						<label>Статус</label>
						<select value={status} onChange={(e) => setStatus(e.target.value)}>
							<option value="online">В сети</option>
							<option value="offline">Не в сети</option>
						</select>
					</div>
				</div>
				<div className="modal-footer">
					<button className="btn-secondary" onClick={handleLogout}>
						Выйти
					</button>
					<button className="btn-primary" onClick={handleSave}>
						Сохранить
					</button>
				</div>
			</div>
		</div>
	);
}

// ============ MAIN APP ============

function App() {
	const [chats, setChats] = useState([]);
	const [channels, setChannels] = useState([]);
	const [stories, setStories] = useState([]);
	const [activeChat, setActiveChat] = useState(null);
	const [messages, setMessages] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [profile, setProfile] = useState(null);
	const messagesEndRef = useRef(null);
	const [showChat, setShowChat] = useState(false);
	const [activeTab, setActiveTab] = useState("chats");
	const [showProfile, setShowProfile] = useState(false);
	const [showContacts, setShowContacts] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(
		!!localStorage.getItem(TOKEN_KEY),
	);
	const [showWelcome, setShowWelcome] = useState(false);

	const getAuthHeaders = () => {
		const token = localStorage.getItem(TOKEN_KEY);
		return token ? { Authorization: `Bearer ${token}` } : {};
	};

	useEffect(() => {
		if (isAuthenticated) {
			checkAuth();
		}
	}, [isAuthenticated]);

	const checkAuth = async () => {
		try {
			const token = localStorage.getItem(TOKEN_KEY);
			const res = await fetch(`${API_BASE}/auth/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				const user = await res.json();
				setProfile(user);
				fetchData();
			} else {
				localStorage.removeItem(TOKEN_KEY);
				setIsAuthenticated(false);
			}
		} catch (err) {
			console.error("Auth check failed:", err);
			setIsAuthenticated(false);
		}
	};

	async function fetchData() {
		setIsLoading(true);
		try {
			const [chatsRes, channelsRes, storiesRes] = await Promise.all([
				fetch(`${API_BASE}/chats`, { headers: getAuthHeaders() }),
				fetch(`${API_BASE}/channels`),
				fetch(`${API_BASE}/stories`),
			]);

			const [chatsData, channelsData, storiesData] = await Promise.all([
				chatsRes.json(),
				channelsRes.json(),
				storiesRes.json(),
			]);

			setChats(Array.isArray(chatsData) ? chatsData : []);
			setChannels(Array.isArray(channelsData) ? channelsData : []);
			setStories(Array.isArray(storiesData) ? storiesData : []);

			if (chatsData.length === 0) {
				setShowWelcome(true);
			}
		} catch (err) {
			console.error("Failed to fetch data:", err);
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchMessages(chatId) {
		try {
			const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			setMessages(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Failed to fetch messages:", err);
		}
	}

	async function sendMessage(text, file, fileType) {
		if (!activeChat || isSending) return;
		setIsSending(true);

		try {
			const res = await fetch(`${API_BASE}/chats/${activeChat.id}/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...getAuthHeaders(),
				},
				body: JSON.stringify({ text }),
			});
			const newMessage = await res.json();

			setMessages((prev) => [...prev, newMessage]);
			setChats((prev) =>
				prev.map((chat) =>
					chat.id === activeChat.id
						? { ...chat, lastMessage: newMessage }
						: chat,
				),
			);
		} catch (err) {
			console.error("Failed to send message:", err);
		} finally {
			setIsSending(false);
		}
	}

	async function updateProfile(data) {
		try {
			const res = await fetch(`${API_BASE}/me`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json", ...getAuthHeaders() },
				body: JSON.stringify(data),
			});
			const updatedProfile = await res.json();
			setProfile(updatedProfile);
			setShowProfile(false);
		} catch (err) {
			console.error("Failed to update profile:", err);
		}
	}

	const handleAuth = (user) => {
		setProfile(user);
		setIsAuthenticated(true);
	};

	const handleLogout = () => {
		setProfile(null);
		setIsAuthenticated(false);
		setChats([]);
		setShowProfile(false);
	};

	const handleAddContact = (chat) => {
		setChats((prev) => [chat, ...prev]);
		setShowWelcome(false);
	};

	const filteredChats = chats.filter((chat) =>
		chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (!isAuthenticated) {
		return <AuthModal onAuth={handleAuth} />;
	}

	return (
		<div className="app">
			<aside className={`sidebar ${showChat ? "hidden" : ""}`}>
				<div className="sidebar-header">
					<h1>Messenger</h1>
					<div className="header-actions">
						<button
							className="action-btn"
							onClick={() => setShowContacts(true)}
							title="Добавить контакт"
						>
							<UserPlus size={20} />
						</button>
						<button className="action-btn" onClick={() => setShowProfile(true)}>
							<Settings size={20} />
						</button>
					</div>
				</div>

				<div className="search-container">
					<Search size={18} />
					<input
						type="text"
						placeholder="Поиск..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="tabs">
					<button
						className={`tab ${activeTab === "chats" ? "active" : ""}`}
						onClick={() => setActiveTab("chats")}
					>
						Чаты ({chats.length})
					</button>
					<button
						className={`tab ${activeTab === "channels" ? "active" : ""}`}
						onClick={() => setActiveTab("channels")}
					>
						Каналы
					</button>
				</div>

				{activeTab === "chats" ? (
					<div className="chat-list">
						{isLoading ? (
							<div className="loading">Загрузка...</div>
						) : filteredChats.length === 0 ? (
							<div className="no-chats">
								{showWelcome ? (
									<>
										<UserPlus size={48} />
										<p>Добро пожаловать!</p>
										<button
											className="btn-primary"
											onClick={() => setShowContacts(true)}
										>
											Добавить контакт
										</button>
									</>
								) : (
									"Чаты не найдены"
								)}
							</div>
						) : (
							filteredChats.map((chat) => (
								<ChatListItem
									key={chat.id}
									chat={chat}
									isActive={activeChat?.id === chat.id}
									onClick={() => {
										setActiveChat(chat);
										setShowChat(true);
									}}
								/>
							))
						)}
					</div>
				) : (
					<div className="channel-list">
						{channels.map((channel) => (
							<ChannelListItem
								key={channel.id}
								channel={channel}
								onClick={() => {}}
							/>
						))}
					</div>
				)}
			</aside>

			<main className={`chat-area ${showChat || true ? "visible" : ""}`}>
				{activeChat ? (
					<>
						<ChatHeader
							chat={activeChat}
							onBack={() => {
								setShowChat(false);
								setActiveChat(null);
							}}
						/>
						<div className="messages-container">
							<div className="messages-wrapper">
								{messages.map((msg) => (
									<MessageBubble
										key={msg.id}
										message={msg}
										isOutgoing={msg.senderId === profile?.id}
									/>
								))}
								<div ref={messagesEndRef} />
							</div>
						</div>
						<MessageInput onSend={sendMessage} disabled={isSending} />
					</>
				) : (
					<EmptyChat />
				)}
			</main>

			{showContacts && (
				<ContactsModal
					onClose={() => setShowContacts(false)}
					onAddContact={handleAddContact}
				/>
			)}

			{showProfile && profile && (
				<ProfileSettings
					profile={profile}
					onClose={() => setShowProfile(false)}
					onUpdate={updateProfile}
					onLogout={handleLogout}
				/>
			)}
		</div>
	);
}

export default App;
