import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { authConfig } from './auth.config';
import { User } from '../models/User';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: authConfig.google.clientID,
  clientSecret: authConfig.google.clientSecret,
  callbackURL: authConfig.google.callbackURL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 'google.id': profile.id });
    
    if (!user) {
      user = await User.create({
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        google: {
          id: profile.id,
          email: profile.emails?.[0]?.value,
        },
        avatar: profile.photos?.[0]?.value,
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error as Error, undefined);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: authConfig.facebook.clientID,
  clientSecret: authConfig.facebook.clientSecret,
  callbackURL: authConfig.facebook.callbackURL,
  profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 'facebook.id': profile.id });
    
    if (!user) {
      user = await User.create({
        email: profile.emails?.[0]?.value,
        name: `${profile._json.first_name} ${profile._json.last_name}`,
        facebook: {
          id: profile.id,
          email: profile.emails?.[0]?.value,
        },
        avatar: profile.photos?.[0]?.value,
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error as Error, undefined);
  }
}));

// Apple Strategy
passport.use(new AppleStrategy({
  clientID: authConfig.apple.clientID,
  teamID: authConfig.apple.teamID,
  keyID: authConfig.apple.keyID,
  callbackURL: authConfig.apple.callbackURL,
  privateKeyLocation: authConfig.apple.privateKeyLocation,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 'apple.id': profile.id });
    
    if (!user) {
      user = await User.create({
        email: profile.emails?.[0]?.value,
        name: profile.name?.firstName + ' ' + profile.name?.lastName,
        apple: {
          id: profile.id,
          email: profile.emails?.[0]?.value,
        },
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error as Error, undefined);
  }
}));

export default passport; 