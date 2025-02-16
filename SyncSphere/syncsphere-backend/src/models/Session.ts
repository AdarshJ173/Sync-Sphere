import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IMediaState {
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  updatedAt: Date;
}

export interface ISession {
  title: string;
  description?: string;
  host: mongoose.Types.ObjectId | IUser;
  participants: (mongoose.Types.ObjectId | IUser)[];
  mediaUrl: string;
  mediaType: 'video' | 'audio';
  mediaState: IMediaState;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  maxParticipants?: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionMethods {
  addParticipant(userId: mongoose.Types.ObjectId): Promise<boolean>;
  removeParticipant(userId: mongoose.Types.ObjectId): Promise<boolean>;
  updateMediaState(state: Partial<IMediaState>): Promise<void>;
}

export interface SessionModel extends Model<ISession, {}, ISessionMethods> {
  findActiveSessionsByUser(userId: mongoose.Types.ObjectId): Promise<Document<ISession>[]>;
}

const mediaStateSchema = new mongoose.Schema<IMediaState>({
  currentTime: {
    type: Number,
    default: 0,
    min: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  volume: {
    type: Number,
    default: 1,
    min: 0,
    max: 1
  },
  playbackRate: {
    type: Number,
    default: 1,
    min: 0.25,
    max: 2
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema<ISession, SessionModel, ISessionMethods>({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required'],
    validate: {
      validator: (value: string) => {
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value);
      },
      message: 'Invalid media URL format'
    }
  },
  mediaType: {
    type: String,
    enum: ['video', 'audio'],
    required: [true, 'Media type is required']
  },
  mediaState: {
    type: mediaStateSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    min: [2, 'Minimum 2 participants required'],
    max: [50, 'Maximum 50 participants allowed']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false,
    validate: {
      validator: function(this: ISession, value: string) {
        return !this.isPrivate || (value && value.length >= 6);
      },
      message: 'Password is required for private sessions and must be at least 6 characters long'
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
sessionSchema.index({ host: 1, isActive: 1 });
sessionSchema.index({ participants: 1, isActive: 1 });
sessionSchema.index({ createdAt: -1 });

// Add participant method
sessionSchema.methods.addParticipant = async function(userId: mongoose.Types.ObjectId): Promise<boolean> {
  if (this.participants.includes(userId)) {
    return false;
  }

  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Session is full');
  }

  this.participants.push(userId);
  await this.save();
  return true;
};

// Remove participant method
sessionSchema.methods.removeParticipant = async function(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const index = this.participants.indexOf(userId);
  if (index === -1) {
    return false;
  }

  this.participants.splice(index, 1);
  await this.save();
  return true;
};

// Update media state method
sessionSchema.methods.updateMediaState = async function(state: Partial<IMediaState>): Promise<void> {
  this.mediaState = {
    ...this.mediaState,
    ...state,
    updatedAt: new Date()
  };
  await this.save();
};

// Static method to find active sessions by user
sessionSchema.static('findActiveSessionsByUser', function(userId: mongoose.Types.ObjectId) {
  return this.find({
    $or: [
      { host: userId },
      { participants: userId }
    ],
    isActive: true
  }).populate('host participants', 'firstName lastName email');
});

// Middleware to handle session cleanup
sessionSchema.pre('save', function(next) {
  if (this.isModified('isActive') && !this.isActive && !this.endTime) {
    this.endTime = new Date();
  }
  next();
});

export const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema); 