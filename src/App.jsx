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
	Eye,
	Heart,
	X,
	Lock,
} from "lucide-react";
import "./App.css";

const API_BASE = "/api";

function formatTime(dateStr) {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return date.toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit",
		});
	} else if (diffDays === 1) {
		return "вчера";
	} else if (diffDays < 7) {
		return date.toLocaleDateString("ru-RU", { weekday: "short" });
	} else {
		return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
	}
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
	if (status === "busy") return "занят(а)";
	if (status === "away") return "отошёл(ла)";
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
	if (status === "read") {
		return <CheckCheck size={14} className="status-icon read" />;
	} else if (status === "delivered" || status === "sent") {
		return <Check size={14} className="status-icon sent" />;
	}
	return null;
}

function Avatar({
	src,
	name,
	isOnline,
	size = 48,
	hasStory = false,
	storyRing = null,
}) {
	return (
		<div className={`avatar avatar-${size}`} style={{ position: "relative" }}>
			{hasStory && (
				<div
					className="story-ring"
					style={{ borderColor: storyRing || "#3390EC" }}
				/>
			)}
			<img src={src} alt={name} className={hasStory ? "has-story" : ""} />
			{isOnline && <div className="online-indicator" />}
		</div>
	);
}

function StoriesBar({ stories, onStoryClick, onAddStory }) {
	const validStories = Array.isArray(stories) ? stories : [];

	return (
		<div className="stories-bar">
			<div className="story-item add-story" onClick={onAddStory}>
				<div className="story-avatar-wrapper add">
					<Plus size={20} />
				</div>
				<span>Добавить</span>
			</div>
			{validStories.map((story, idx) => (
				<div
					key={story.id}
					className="story-item"
					onClick={() => onStoryClick(story, validStories.slice(0, idx + 1))}
				>
					<div
						className="story-avatar-wrapper"
						style={{
							background: story.views?.includes("me")
								? "transparent"
								: "linear-gradient(45deg, #3390EC, #2B5B8A)",
						}}
					>
						<img
							src={story.userAvatar || story.userAvatar}
							alt={story.userName || "User"}
						/>
					</div>
					<span>{(story.userName || "User").split(" ")[0]}</span>
				</div>
			))}
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
						{chat.lastMessage?.attachment?.type === "image" && "📷 "}
						{chat.lastMessage?.attachment?.type === "video" && "🎬 "}
						{chat.lastMessage?.attachment?.type === "audio" && "🎵 "}
						{chat.lastMessage?.attachment?.type === "document" && "📄 "}
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
					{formatNumber(channel.members)} подписчиков
				</div>
			</div>
			{channel.subscribed && <span className="subscribed-badge">✓</span>}
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
					{message.attachment.type === "video" && (
						<div className="video-preview">
							<img
								src={message.attachment.thumbnail || message.attachment.url}
								alt={message.attachment.filename}
							/>
							<div className="play-overlay">
								<Play size={32} fill="white" />
							</div>
							{message.attachment.duration && (
								<span className="video-duration">
									{message.attachment.duration}s
								</span>
							)}
						</div>
					)}
					{message.attachment.type === "audio" && (
						<div className="audio-preview">
							<Music size={20} />
							<div className="audio-info">
								<span className="audio-name">
									{message.attachment.filename}
								</span>
								{message.attachment.duration && (
									<span className="audio-duration">
										{message.attachment.duration}s
									</span>
								)}
							</div>
						</div>
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

function AttachMenu({ onSelect, onClose }) {
	const menuItems = [
		{ type: "image", icon: Image, label: "Фото/Видео" },
		{ type: "audio", icon: Music, label: "Музыка" },
		{ type: "document", icon: FileText, label: "Документ" },
		{ type: "camera", icon: Camera, label: "Камера" },
	];

	return (
		<div className="attach-menu-overlay" onClick={onClose}>
			<div className="attach-menu" onClick={(e) => e.stopPropagation()}>
				{menuItems.map((item) => (
					<button
						key={item.type}
						className="attach-menu-item"
						onClick={() => onSelect(item.type)}
					>
						<item.icon size={24} />
						<span>{item.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}

function FilePreview({ file, type, onRemove, onSend, text, setText }) {
	const previewUrl = file ? URL.createObjectURL(file) : null;

	return (
		<div className="file-preview">
			<button className="file-preview-close" onClick={onRemove}>
				<X size={16} />
			</button>
			{type === "image" && previewUrl && <img src={previewUrl} alt="Preview" />}
			{type === "video" && previewUrl && <video src={previewUrl} controls />}
			{type === "audio" && (
				<div className="audio-preview-container">
					<Music size={32} />
					<span>{file?.name}</span>
				</div>
			)}
			{type === "document" && (
				<div className="document-preview-container">
					<FileText size={32} />
					<span>{file?.name}</span>
				</div>
			)}
			<div className="file-preview-input">
				<input
					type="text"
					placeholder="Подпись..."
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				<button onClick={() => onSend(text || file?.name || "Отправлено")}>
					<Send size={20} />
				</button>
			</div>
		</div>
	);
}

function MessageInput({ onSend, disabled }) {
	const [text, setText] = useState("");
	const [showAttach, setShowAttach] = useState(false);
	const [attachedFile, setAttachedFile] = useState(null);
	const [attachType, setAttachType] = useState(null);
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);

	const handleSubmit = (e) => {
		e?.preventDefault();
		if ((text.trim() || attachedFile) && !disabled) {
			onSend(
				text.trim() ||
					(attachedFile
						? `[${attachType}: ${attachedFile.name}]`
						: "Отправлено"),
				attachedFile,
				attachType,
			);
			setText("");
			setAttachedFile(null);
			setAttachType(null);
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleInput = (e) => {
		setText(e.target.value);
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height =
				Math.min(textareaRef.current.scrollHeight, 150) + "px";
		}
	};

	const handleAttachSelect = (type) => {
		setShowAttach(false);
		setAttachType(type);
		fileInputRef.current?.click();
	};

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			setAttachedFile(file);
		}
	};

	const removeAttachment = () => {
		setAttachedFile(null);
		setAttachType(null);
	};

	return (
		<div className="message-input-container">
			{attachedFile && (
				<FilePreview
					file={attachedFile}
					type={attachType}
					onRemove={removeAttachment}
					onSend={handleSubmit}
					text={text}
					setText={setText}
				/>
			)}

			{!attachedFile && (
				<>
					<button
						type="button"
						className="input-action-btn"
						onClick={() => setShowAttach(true)}
					>
						<Paperclip size={20} />
					</button>
					<div className="input-wrapper">
						<textarea
							ref={textareaRef}
							value={text}
							onChange={handleInput}
							onKeyDown={handleKeyDown}
							placeholder="Сообщение..."
							rows={1}
							disabled={disabled}
						/>
					</div>
					<button type="button" className="input-action-btn">
						<Smile size={20} />
					</button>
					<button
						type="submit"
						className={`send-btn ${text.trim() ? "active" : ""}`}
						onClick={handleSubmit}
						disabled={!text.trim() || disabled}
					>
						<Send size={20} />
					</button>
				</>
			)}

			<input
				ref={fileInputRef}
				type="file"
				accept={
					attachType === "image"
						? "image/*"
						: attachType === "video"
							? "video/*"
							: attachType === "audio"
								? "audio/*"
								: "*/*"
				}
				style={{ display: "none" }}
				onChange={handleFileChange}
			/>

			{showAttach && (
				<AttachMenu
					onSelect={handleAttachSelect}
					onClose={() => setShowAttach(false)}
				/>
			)}
		</div>
	);
}

function EmptyChat() {
	return (
		<div className="empty-chat">
			<div className="empty-chat-icon">
				<svg
					width="120"
					height="120"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
				>
					<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
				</svg>
			</div>
			<h2>Выберите чат</h2>
			<p>Выберите чат из списка слева, чтобы начать общение</p>
		</div>
	);
}

function StoryViewer({ stories, currentIndex, onClose, onNext, onPrev }) {
	const story = stories[currentIndex];
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress(0);
		const interval = setInterval(() => {
			setProgress((p) => p + 2);
		}, 100);

		const timer = setTimeout(() => {
			if (currentIndex < stories.length - 1) {
				onNext();
			} else {
				onClose();
			}
		}, 5000);

		return () => {
			clearInterval(interval);
			clearTimeout(timer);
		};
	}, [currentIndex]);

	useEffect(() => {
		const handleKey = (e) => {
			if (e.key === "ArrowRight") onNext();
			if (e.key === "ArrowLeft") onPrev();
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [currentIndex]);

	return (
		<div className="story-viewer" onClick={onClose}>
			<div
				className="story-viewer-content"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="story-progress">
					{stories.map((_, idx) => (
						<div
							key={idx}
							className={`progress-bar ${idx <= currentIndex ? "active" : ""}`}
						>
							<div
								className="progress-fill"
								style={{
									width:
										idx < currentIndex
											? "100%"
											: `${idx === currentIndex ? progress : 0}%`,
								}}
							/>
						</div>
					))}
				</div>

				<div className="story-header">
					<div className="story-user">
						<img src={story.userAvatar} alt={story.userName} />
						<span>{story.userName}</span>
					</div>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<div className="story-media">
					{story.mediaType === "video" ? (
						<video src={story.mediaUrl} autoPlay loop />
					) : (
						<img src={story.mediaUrl} alt="Story" />
					)}
				</div>

				<div className="story-footer">
					<div className="story-views">
						<Eye size={16} />
						<span>{story.views?.length || 0} просмотров</span>
					</div>
				</div>

				<div
					className="story-nav prev"
					onClick={(e) => {
						e.stopPropagation();
						onPrev();
					}}
				/>
				<div
					className="story-nav next"
					onClick={(e) => {
						e.stopPropagation();
						onNext();
					}}
				/>
			</div>
		</div>
	);
}

function ChannelView({ channel, onBack }) {
	return (
		<div className="channel-view">
			<div className="channel-header">
				<button className="back-button" onClick={onBack}>
					<ArrowLeft size={20} />
				</button>
				<Avatar
					src={channel.avatar}
					name={channel.name}
					isOnline={false}
					size={40}
				/>
				<div className="channel-header-info">
					<span className="channel-header-name">
						{channel.isPrivate && <Lock size={14} />}
						{channel.name}
					</span>
					<span className="channel-header-members">
						{formatNumber(channel.members)} подписчиков
					</span>
				</div>
				<button className="action-btn">
					<MoreVertical size={20} />
				</button>
			</div>

			<div className="channel-description">
				<p>{channel.description}</p>
			</div>

			<div className="channel-actions">
				<button
					className={`subscribe-btn ${channel.subscribed ? "subscribed" : ""}`}
				>
					{channel.subscribed ? "Отписаться" : "Подписаться"}
				</button>
			</div>

			<div className="channel-posts">
				{channel.posts?.map((post) => (
					<div key={post.id} className="post-card">
						<div className="post-content">{post.content}</div>
						{post.mediaUrl && post.mediaType === "image" && (
							<img
								src={post.mediaUrl}
								alt="Post media"
								className="post-media"
							/>
						)}
						<div className="post-stats">
							<span>
								<Eye size={14} /> {formatNumber(post.views)}
							</span>
							<span>
								<Heart size={14} /> {formatNumber(post.likes)}
							</span>
						</div>
						<div className="post-time">{formatTime(post.createdAt)}</div>
					</div>
				))}
			</div>
		</div>
	);
}

function CreateChannelModal({ onClose, onCreate }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isPrivate, setIsPrivate] = useState(false);

	const handleCreate = () => {
		if (name.trim()) {
			onCreate({ name: name.trim(), description, isPrivate });
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Создать канал</h2>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div className="modal-body">
					<input
						type="text"
						placeholder="Название канала"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<textarea
						placeholder="Описание (необязательно)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<label className="private-toggle">
						<input
							type="checkbox"
							checked={isPrivate}
							onChange={(e) => setIsPrivate(e.target.checked)}
						/>
						<span>Приватный канал</span>
					</label>
				</div>
				<div className="modal-footer">
					<button className="btn-secondary" onClick={onClose}>
						Отмена
					</button>
					<button
						className="btn-primary"
						onClick={handleCreate}
						disabled={!name.trim()}
					>
						Создать
					</button>
				</div>
			</div>
		</div>
	);
}

function AddStoryModal({ onClose, onCreate }) {
	const [imageUrl, setImageUrl] = useState("");
	const [storyType] = useState("image");

	const demoImages = [
		"https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400",
		"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
		"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
		"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
	];

	const handleCreate = () => {
		const url =
			imageUrl || demoImages[Math.floor(Math.random() * demoImages.length)];
		onCreate({ mediaUrl: url, mediaType: storyType });
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content story-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>Добавить статус</h2>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div className="modal-body">
					<p className="story-info">
						Статус будет виден всем вашим контактам в течение 24 часов
					</p>

					<div className="story-preview-area">
						{imageUrl ? (
							<img src={imageUrl} alt="Story preview" />
						) : (
							<div className="story-preview-placeholder">
								<Camera size={48} />
								<span>Выберите фото</span>
							</div>
						)}
					</div>

					<div className="demo-images">
						{demoImages.map((url, idx) => (
							<button
								key={idx}
								className="demo-image-btn"
								onClick={() => setImageUrl(url)}
							>
								<img src={url} alt={`Demo ${idx + 1}`} />
							</button>
						))}
					</div>

					<input
						type="text"
						placeholder="Или вставьте URL изображения"
						value={imageUrl}
						onChange={(e) => setImageUrl(e.target.value)}
					/>
				</div>
				<div className="modal-footer">
					<button className="btn-secondary" onClick={onClose}>
						Отмена
					</button>
					<button className="btn-primary" onClick={handleCreate}>
						Добавить статус
					</button>
				</div>
			</div>
		</div>
	);
}

function ProfileSettings({ profile, onClose, onUpdate }) {
	const [name, setName] = useState(profile.name);
	const [bio, setBio] = useState(profile.bio);
	const [status, setStatus] = useState(profile.status);

	const handleSave = () => {
		onUpdate({ name, bio, status });
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content profile-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>Настройки профиля</h2>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div className="modal-body">
					<div className="profile-avatar-edit">
						<img src={profile.avatar} alt={profile.name} />
						<button className="change-avatar-btn">
							<Camera size={16} />
						</button>
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
							<option value="busy">Занят(а)</option>
							<option value="away">Отошёл(ла)</option>
						</select>
					</div>
				</div>
				<div className="modal-footer">
					<button className="btn-secondary" onClick={onClose}>
						Отмена
					</button>
					<button className="btn-primary" onClick={handleSave}>
						Сохранить
					</button>
				</div>
			</div>
		</div>
	);
}

function App() {
	const [chats, setChats] = useState([]);
	const [channels, setChannels] = useState([]);
	const [stories, setStories] = useState([]);
	const [activeChat, setActiveChat] = useState(null);
	const [activeChannel, setActiveChannel] = useState(null);
	const [messages, setMessages] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [profile, setProfile] = useState(null);
	const messagesEndRef = useRef(null);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [showChat, setShowChat] = useState(false);
	const [activeTab, setActiveTab] = useState("chats");
	const [viewingStory, setViewingStory] = useState(null);
	const [storyIndex, setStoryIndex] = useState(0);
	const [showCreateChannel, setShowCreateChannel] = useState(false);
	const [showAddStory, setShowAddStory] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth >= 768) {
				setShowChat(true);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (activeChat) {
			fetchMessages(activeChat.id);
			setActiveChannel(null);
			setShowChat(true);
		}
	}, [activeChat]);

	useEffect(() => {
		if (messages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	async function fetchData() {
		try {
			const [chatsRes, channelsRes, storiesRes, profileRes] = await Promise.all(
				[
					fetch(`${API_BASE}/chats`),
					fetch(`${API_BASE}/channels`),
					fetch(`${API_BASE}/stories`),
					fetch(`${API_BASE}/me`),
				],
			);

			const [chatsData, channelsData, storiesData, profileData] =
				await Promise.all([
					chatsRes.json(),
					channelsRes.json(),
					storiesRes.json(),
					profileRes.json(),
				]);

			setChats(chatsData);
			setChannels(channelsData);
			setStories(storiesData);
			setProfile(profileData);
		} catch (err) {
			console.error("Failed to fetch data:", err);
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchMessages(chatId) {
		try {
			const res = await fetch(`${API_BASE}/chats/${chatId}/messages`);
			const data = await res.json();
			setMessages(data);
		} catch (err) {
			console.error("Failed to fetch messages:", err);
		}
	}

	async function sendMessage(text, file, fileType) {
		if (!activeChat || isSending) return;
		setIsSending(true);

		let attachment = null;

		if (file && fileType) {
			const formData = new FormData();
			formData.append("file", file);

			try {
				const uploadRes = await fetch(`${API_BASE}/upload`, {
					method: "POST",
					body: formData,
				});
				const uploadData = await uploadRes.json();

				attachment = {
					type: fileType === "image" ? "image" : fileType,
					url: uploadData.url,
					filename: file.name,
					size: uploadData.size,
				};
			} catch (err) {
				console.error("Failed to upload file:", err);
			}
		}

		const tempMessage = {
			id: "temp-" + Date.now(),
			text,
			timestamp: new Date().toISOString(),
			senderId: "me",
			status: "sending",
			attachment,
		};
		setMessages((prev) => [...prev, tempMessage]);

		try {
			const res = await fetch(`${API_BASE}/chats/${activeChat.id}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, attachment }),
			});
			const newMessage = await res.json();

			setMessages((prev) =>
				prev.map((m) => (m.id === tempMessage.id ? newMessage : m)),
			);

			setChats((prev) =>
				prev.map((chat) => {
					if (chat.id === activeChat.id) {
						return { ...chat, lastMessage: newMessage };
					}
					return chat;
				}),
			);
		} catch (err) {
			console.error("Failed to send message:", err);
			setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
		} finally {
			setIsSending(false);
		}
	}

	async function createChannel(data) {
		try {
			const res = await fetch(`${API_BASE}/channels`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const newChannel = await res.json();
			setChannels((prev) => [newChannel, ...prev]);
			setShowCreateChannel(false);
		} catch (err) {
			console.error("Failed to create channel:", err);
		}
	}

	async function createStory(data) {
		try {
			const res = await fetch(`${API_BASE}/stories`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const newStory = await res.json();
			setStories((prev) => [newStory, ...prev]);
			setShowAddStory(false);
		} catch (err) {
			console.error("Failed to create story:", err);
		}
	}

	async function updateProfile(data) {
		try {
			const res = await fetch(`${API_BASE}/me`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const updatedProfile = await res.json();
			setProfile(updatedProfile);
			setShowProfile(false);
		} catch (err) {
			console.error("Failed to update profile:", err);
		}
	}

	const filteredChats = chats.filter((chat) =>
		chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleBack = () => {
		setShowChat(false);
		setActiveChat(null);
		setActiveChannel(null);
	};

	const handleStoryClick = (story, storySlice) => {
		setViewingStory(storySlice);
		setStoryIndex(storySlice.indexOf(story));
	};

	const handleStoryNext = () => {
		if (storyIndex < viewingStory.length - 1) {
			setStoryIndex((prev) => prev + 1);
		}
	};

	const handleStoryPrev = () => {
		if (storyIndex > 0) {
			setStoryIndex((prev) => prev - 1);
		}
	};

	const handleChannelClick = (channel) => {
		setActiveChannel(channel);
		setActiveChat(null);
		setShowChat(true);
	};

	return (
		<div className="app">
			<aside className={`sidebar ${showChat && isMobile ? "hidden" : ""}`}>
				<div className="sidebar-header">
					<h1>Messenger</h1>
					<div className="header-actions">
						<button className="action-btn" onClick={() => setShowProfile(true)}>
							<Settings size={20} />
						</button>
					</div>
				</div>

				<StoriesBar
					stories={stories}
					onStoryClick={handleStoryClick}
					onAddStory={() => setShowAddStory(true)}
				/>

				<div className="search-container">
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
						Чаты
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
							<div className="no-chats">Чаты не найдены</div>
						) : (
							filteredChats.map((chat) => (
								<ChatListItem
									key={chat.id}
									chat={chat}
									isActive={activeChat?.id === chat.id}
									onClick={() => setActiveChat(chat)}
								/>
							))
						)}
					</div>
				) : (
					<div className="channel-list">
						<button
							className="create-channel-btn"
							onClick={() => setShowCreateChannel(true)}
						>
							<Plus size={18} />
							Создать канал
						</button>
						{channels.map((channel) => (
							<ChannelListItem
								key={channel.id}
								channel={channel}
								onClick={() => handleChannelClick(channel)}
							/>
						))}
					</div>
				)}
			</aside>

			<main className={`chat-area ${showChat || !isMobile ? "visible" : ""}`}>
				{activeChannel ? (
					<ChannelView channel={activeChannel} onBack={handleBack} />
				) : activeChat ? (
					<>
						<ChatHeader chat={activeChat} onBack={handleBack} />
						<div className="messages-container">
							<div className="messages-wrapper">
								{messages.map((msg, index) => {
									const isOutgoing = msg.senderId === "me";
									const prevMsg = messages[index - 1];
									const showDate =
										!prevMsg ||
										new Date(msg.timestamp).toDateString() !==
											new Date(prevMsg.timestamp).toDateString();

									return (
										<div key={msg.id}>
											{showDate && (
												<div className="date-separator">
													{formatTime(msg.timestamp)}
												</div>
											)}
											<MessageBubble message={msg} isOutgoing={isOutgoing} />
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>
						</div>
						<MessageInput onSend={sendMessage} disabled={isSending} />
					</>
				) : (
					<EmptyChat />
				)}
			</main>

			{viewingStory && (
				<StoryViewer
					stories={viewingStory}
					currentIndex={storyIndex}
					onClose={() => setViewingStory(null)}
					onNext={handleStoryNext}
					onPrev={handleStoryPrev}
				/>
			)}

			{showCreateChannel && (
				<CreateChannelModal
					onClose={() => setShowCreateChannel(false)}
					onCreate={createChannel}
				/>
			)}

			{showAddStory && (
				<AddStoryModal
					onClose={() => setShowAddStory(false)}
					onCreate={createStory}
				/>
			)}

			{showProfile && profile && (
				<ProfileSettings
					profile={profile}
					onClose={() => setShowProfile(false)}
					onUpdate={updateProfile}
				/>
			)}
		</div>
	);
}

export default App;
