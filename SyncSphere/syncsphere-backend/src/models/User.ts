import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface IUser extends Document {
  email: string;
  name: string;
  avatar?: string;
  google?: {
    id: string;
    email: string;
  };
  facebook?: {
    id: string;
    email: string;
  };
  apple?: {
    id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

export interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<(Document<unknown, {}, IUser> & IUser & IUserMethods) | null>;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  google: {
    id: String,
    email: String,
  },
  facebook: {
    id: String,
    email: String,
  },
  apple: {
    id: String,
    email: String,
  },
}, {
  timestamps: true,
});

// Ensure email uniqueness across all auth providers
UserSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email
    },
    config.jwt.secret,
    { 
      expiresIn: config.jwt.expiresIn 
    }
  );
};

// Static method to find user by email
UserSchema.static('findByEmail', function(email: string) {
  return this.findOne({ email }).select('+password');
});

export const User = mongoose.model<IUser>('User', UserSchema); 