import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';

export type RelationshipStatus = 'pending' | 'accepted' | 'blocked';

export interface IUserRelationship {
  requester: mongoose.Types.ObjectId | IUser;
  recipient: mongoose.Types.ObjectId | IUser;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRelationshipMethods {
  accept(): Promise<void>;
  reject(): Promise<void>;
  block(): Promise<void>;
}

export interface UserRelationshipModel extends Model<IUserRelationship, {}, IUserRelationshipMethods> {
  findRelationship(user1Id: mongoose.Types.ObjectId, user2Id: mongoose.Types.ObjectId): Promise<Document<IUserRelationship> | null>;
  getFriends(userId: mongoose.Types.ObjectId): Promise<Document<IUserRelationship>[]>;
  getPendingRequests(userId: mongoose.Types.ObjectId): Promise<Document<IUserRelationship>[]>;
}

const userRelationshipSchema = new mongoose.Schema<IUserRelationship, UserRelationshipModel, IUserRelationshipMethods>({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique relationships and efficient queries
userRelationshipSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);

// Index for status-based queries
userRelationshipSchema.index({ status: 1 });

// Methods
userRelationshipSchema.methods.accept = async function(): Promise<void> {
  if (this.status !== 'pending') {
    throw new Error('Can only accept pending relationships');
  }
  this.status = 'accepted';
  await this.save();
};

userRelationshipSchema.methods.reject = async function(): Promise<void> {
  if (this.status !== 'pending') {
    throw new Error('Can only reject pending relationships');
  }
  await this.deleteOne();
};

userRelationshipSchema.methods.block = async function(): Promise<void> {
  this.status = 'blocked';
  await this.save();
};

// Static methods
userRelationshipSchema.static('findRelationship', function(user1Id: mongoose.Types.ObjectId, user2Id: mongoose.Types.ObjectId) {
  return this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id }
    ]
  });
});

userRelationshipSchema.static('getFriends', function(userId: mongoose.Types.ObjectId) {
  return this.find({
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
    ]
  }).populate('requester recipient', 'firstName lastName email');
});

userRelationshipSchema.static('getPendingRequests', function(userId: mongoose.Types.ObjectId) {
  return this.find({
    recipient: userId,
    status: 'pending'
  }).populate('requester', 'firstName lastName email');
});

// Middleware to prevent self-relationships
userRelationshipSchema.pre('save', function(next) {
  if (this.requester.toString() === this.recipient.toString()) {
    next(new Error('Cannot create relationship with self'));
  }
  next();
});

export const UserRelationship = mongoose.model<IUserRelationship, UserRelationshipModel>('UserRelationship', userRelationshipSchema); 