import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IQueueItem {
  videoId: string;
  title: string;
  duration: string;
  thumbnail: string;
  addedBy: mongoose.Types.ObjectId | IUser;
  addedAt: Date;
}

export interface IQueue {
  sessionId: mongoose.Types.ObjectId;
  items: IQueueItem[];
  currentIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQueueMethods {
  addItem(item: Omit<IQueueItem, 'addedAt'>): Promise<void>;
  removeItem(index: number): Promise<void>;
  moveItem(fromIndex: number, toIndex: number): Promise<void>;
  getCurrentItem(): IQueueItem | null;
  getNextItem(): IQueueItem | null;
  getPreviousItem(): IQueueItem | null;
}

export interface QueueModel extends Model<IQueue, {}, IQueueMethods> {
  findBySessionId(sessionId: mongoose.Types.ObjectId): Promise<Document<IQueue> | null>;
}

const queueItemSchema = new mongoose.Schema<IQueueItem>({
  videoId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const queueSchema = new mongoose.Schema<IQueue, QueueModel, IQueueMethods>({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true
  },
  items: [queueItemSchema],
  currentIndex: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
queueSchema.index({ sessionId: 1 });

// Methods
queueSchema.methods.addItem = async function(item: Omit<IQueueItem, 'addedAt'>): Promise<void> {
  this.items.push({
    ...item,
    addedAt: new Date()
  });
  await this.save();
};

queueSchema.methods.removeItem = async function(index: number): Promise<void> {
  if (index < 0 || index >= this.items.length) {
    throw new Error('Invalid queue index');
  }

  this.items.splice(index, 1);
  
  // Adjust currentIndex if necessary
  if (index < this.currentIndex) {
    this.currentIndex--;
  } else if (this.currentIndex >= this.items.length) {
    this.currentIndex = Math.max(0, this.items.length - 1);
  }

  await this.save();
};

queueSchema.methods.moveItem = async function(fromIndex: number, toIndex: number): Promise<void> {
  if (
    fromIndex < 0 || 
    fromIndex >= this.items.length ||
    toIndex < 0 ||
    toIndex >= this.items.length
  ) {
    throw new Error('Invalid queue index');
  }

  const [item] = this.items.splice(fromIndex, 1);
  this.items.splice(toIndex, 0, item);

  // Adjust currentIndex if necessary
  if (fromIndex === this.currentIndex) {
    this.currentIndex = toIndex;
  } else if (
    fromIndex < this.currentIndex && 
    toIndex >= this.currentIndex
  ) {
    this.currentIndex--;
  } else if (
    fromIndex > this.currentIndex && 
    toIndex <= this.currentIndex
  ) {
    this.currentIndex++;
  }

  await this.save();
};

queueSchema.methods.getCurrentItem = function(): IQueueItem | null {
  return this.items[this.currentIndex] || null;
};

queueSchema.methods.getNextItem = function(): IQueueItem | null {
  const nextIndex = this.currentIndex + 1;
  return nextIndex < this.items.length ? this.items[nextIndex] : null;
};

queueSchema.methods.getPreviousItem = function(): IQueueItem | null {
  const prevIndex = this.currentIndex - 1;
  return prevIndex >= 0 ? this.items[prevIndex] : null;
};

// Static methods
queueSchema.static('findBySessionId', function(sessionId: mongoose.Types.ObjectId) {
  return this.findOne({ sessionId }).populate('items.addedBy', 'firstName lastName');
});

export const Queue = mongoose.model<IQueue, QueueModel>('Queue', queueSchema); 