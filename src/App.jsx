import { useState, useEffect, useRef } from "react";
import {
	MoreVertical,
	Paperclip,
	Smile,
	Check,
	CheckCheck,
	ArrowLeft,
	Phone,
	Video,
	FileText,
	Send,
	Settings,
	UserPlus,
	MessageCircle,
	Search,
	Globe,
	Key,
	Bell,
	Database,
	Folder,
	Monitor,
	BatteryCharging,
	ChevronRight,
	User,
	Info,
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
				accept="image/*"
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

// ============ BOTTOM NAVIGATION ============

function BottomNav({ activeTab, onTabChange }) {
	return (
		<nav className="bottom-nav">
			<button
				className={`nav-item ${activeTab === "chats" ? "active" : ""}`}
				onClick={() => onTabChange("chats")}
			>
				<MessageCircle size={24} />
				<span>Чаты</span>
			</button>
			<button
				className={`nav-item ${activeTab === "contacts" ? "active" : ""}`}
				onClick={() => onTabChange("contacts")}
			>
				<UserPlus size={24} />
				<span>Контакты</span>
			</button>
			<button
				className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
				onClick={() => onTabChange("settings")}
			>
				<Settings size={24} />
				<span>Настройки</span>
			</button>
			<button
				className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
				onClick={() => onTabChange("profile")}
			>
				<User size={24} />
				<span>Профиль</span>
			</button>
		</nav>
	);
}

// ============ SETTINGS PAGE ============

function SettingsPage({ onOpenSection }) {
	const sections = [
		{
			id: "account",
			icon: User,
			color: "#3390EC",
			title: "Аккаунт",
			subtitle: "Номер, имя пользователя, «О себе»",
		},
		{
			id: "chats",
			icon: MessageCircle,
			color: "#F59E0B",
			title: "Настройки чатов",
			subtitle: "Обои, ночной режим, анимации",
		},
		{
			id: "privacy",
			icon: Key,
			color: "#10B981",
			title: "Конфиденциальность",
			subtitle: "Время захода, устройства, ключи доступа",
		},
		{
			id: "notifications",
			icon: Bell,
			color: "#EF4444",
			title: "Уведомления",
			subtitle: "Звуки, звонки, счётчик сообщений",
		},
		{
			id: "data",
			icon: Database,
			color: "#3B82F6",
			title: "Данные и память",
			subtitle: "Настройки загрузки медиафайлов",
		},
		{
			id: "folders",
			icon: Folder,
			color: "#3B82F6",
			title: "Папки с чатами",
			subtitle: "Сортировка чатов по папкам",
		},
		{
			id: "devices",
			icon: Monitor,
			color: "#06B6D4",
			title: "Устройства",
			subtitle: "Управление активными сеансами",
		},
		{
			id: "power",
			icon: BatteryCharging,
			color: "#F59E0B",
			title: "Энергосбережение",
			subtitle: "Экономия энергии при низком заряде",
		},
		{
			id: "language",
			icon: Globe,
			color: "#8B5CF6",
			title: "Язык",
			subtitle: "Русский",
		},
	];

	return (
		<div className="settings-page">
			<div className="settings-header">
				<h2>Настройки</h2>
			</div>
			<div className="settings-list">
				{sections.map((section) => (
					<div
						key={section.id}
						className="settings-item"
						onClick={() => onOpenSection(section.id)}
					>
						<div
							className="settings-icon"
							style={{ backgroundColor: section.color }}
						>
							<section.icon size={20} color="white" />
						</div>
						<div className="settings-text">
							<span className="settings-title">{section.title}</span>
							<span className="settings-subtitle">{section.subtitle}</span>
						</div>
						<ChevronRight size={20} className="settings-arrow" />
					</div>
				))}
			</div>
		</div>
	);
}

function SettingsSectionPage({ sectionId, onBack }) {
	const getSectionTitle = () => {
		const titles = {
			account: "Аккаунт",
			chats: "Настройки чатов",
			privacy: "Конфиденциальность",
			notifications: "Уведомления",
			data: "Данные и память",
			folders: "Папки с чатами",
			devices: "Устройства",
			power: "Энергосбережение",
			language: "Язык",
		};
		return titles[sectionId] || "Настройки";
	};

	return (
		<div className="settings-page">
			<div className="settings-header">
				<button className="back-button" onClick={onBack}>
					<ArrowLeft size={20} />
				</button>
				<h2>{getSectionTitle()}</h2>
			</div>
			<div className="section-content">
				<div className="info-card">
					<Info size={20} />
					<p>
						Настройки раздела "{getSectionTitle()}" будут доступны в следующей
						версии.
					</p>
				</div>
			</div>
		</div>
	);
}

// ============ PROFILE PAGE ============

function ProfilePage({ profile, onLogout }) {
	if (!profile) return null;

	return (
		<div className="profile-page">
			<div className="profile-header">
				<h2>Профиль</h2>
			</div>
			<div className="profile-content">
				<div className="profile-avatar-large">
					<img src={profile.avatar} alt={profile.name} />
				</div>
				<h3 className="profile-name">{profile.name}</h3>
				<p className="profile-phone">{profile.phone}</p>
				{profile.bio && <p className="profile-bio">{profile.bio}</p>}

				<div className="profile-actions">
					<button className="btn-secondary" onClick={onLogout}>
						Выйти
					</button>
				</div>
			</div>
		</div>
	);
}

// ============ CONTACTS PAGE ============

function ContactsPage({ onAddContact }) {
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
		<div className="contacts-page">
			<div className="contacts-header">
				<h2>Контакты</h2>
			</div>

			<div className="search-container">
				<Search size={18} />
				<input
					type="text"
					placeholder="Поиск..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="contacts-list-page">
				{loading ? (
					<div className="loading">Загрузка...</div>
				) : filtered.length === 0 ? (
					<div className="no-contacts">Контакты не найдены</div>
				) : (
					filtered.map((user) => (
						<div key={user.id} className="contact-item-page">
							<Avatar
								src={user.avatar}
								name={user.name}
								isOnline={user.status === "online"}
								size={48}
							/>
							<div className="contact-info-page">
								<span className="contact-name-page">{user.name}</span>
								<span className="contact-phone-page">{user.phone}</span>
								<span className="contact-bio-page">{user.bio}</span>
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
	);
}

// ============ CHATS PAGE ============

function ChatsPage({ chats, activeChat, onSelectChat }) {
	const [search, setSearch] = useState("");
	const filtered = chats.filter((chat) =>
		chat.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="chats-page">
			<div className="chats-header">
				<h2>Чаты</h2>
			</div>

			<div className="search-container">
				<Search size={18} />
				<input
					type="text"
					placeholder="Поиск..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="chats-list-page">
				{filtered.length === 0 ? (
					<div className="no-chats">
						<MessageCircle size={48} />
						<p>Нет чатов</p>
					</div>
				) : (
					filtered.map((chat) => (
						<ChatListItem
							key={chat.id}
							chat={chat}
							isActive={activeChat?.id === chat.id}
							onClick={() => onSelectChat(chat)}
						/>
					))
				)}
			</div>
		</div>
	);
}

// ============ MAIN APP ============

function App() {
	const [chats, setChats] = useState([]);
	const [activeChat, setActiveChat] = useState(null);
	const [messages, setMessages] = useState([]);
	const [, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [profile, setProfile] = useState(null);
	const messagesEndRef = useRef(null);
	const [showChat, setShowChat] = useState(false);
	const [activeTab, setActiveTab] = useState("chats");
	const [isAuthenticated, setIsAuthenticated] = useState(
		!!localStorage.getItem(TOKEN_KEY),
	);
	const [settingsSection, setSettingsSection] = useState(null);

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
			const [chatsRes] = await Promise.all([
				fetch(`${API_BASE}/chats`, { headers: getAuthHeaders() }),
			]);
			const [chatsData] = await Promise.all([chatsRes.json()]);
			setChats(Array.isArray(chatsData) ? chatsData : []);
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

	async function sendMessage(text) {
		if (!activeChat || isSending) return;
		setIsSending(true);

		try {
			const res = await fetch(`${API_BASE}/chats/${activeChat.id}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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

	const handleAuth = (user) => {
		setProfile(user);
		setIsAuthenticated(true);
	};

	const handleLogout = () => {
		localStorage.removeItem(TOKEN_KEY);
		setProfile(null);
		setIsAuthenticated(false);
		setChats([]);
	};

	const handleAddContact = (chat) => {
		setChats((prev) => [chat, ...prev]);
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setSettingsSection(null);
		if (tab !== "chats") {
			setShowChat(false);
			setActiveChat(null);
		}
	};

	const handleSelectChat = (chat) => {
		setActiveChat(chat);
		fetchMessages(chat.id);
		setShowChat(true);
		setActiveTab("chats");
	};

	useEffect(() => {
		if (messages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Auto-login with demo user (no auth required)
	if (!isAuthenticated) {
		const demoUser = {
			id: "demo_user",
			name: "Вы",
			phone: "+79001234567",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
			status: "online",
			bio: "Я использую ZIPCHAT",
		};
		handleAuth(demoUser);
		return null;
	}

	// ============ CHAT VIEW ============
	if (showChat && activeChat) {
		return (
			<div className="app">
				<main className="chat-area-full">
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
				</main>
				<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
			</div>
		);
	}

	// ============ MAIN CONTENT ============
	return (
		<div className="app">
			<main className="main-content">
				{activeTab === "chats" && (
					<ChatsPage
						chats={chats}
						activeChat={activeChat}
						onSelectChat={handleSelectChat}
					/>
				)}
				{activeTab === "contacts" && (
					<ContactsPage onAddContact={handleAddContact} />
				)}
				{activeTab === "settings" && !settingsSection && (
					<SettingsPage onOpenSection={setSettingsSection} />
				)}
				{activeTab === "settings" && settingsSection && (
					<SettingsSectionPage
						sectionId={settingsSection}
						onBack={() => setSettingsSection(null)}
					/>
				)}
				{activeTab === "profile" && (
					<ProfilePage profile={profile} onLogout={handleLogout} />
				)}
			</main>
			<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
		</div>
	);
}

export default App;
