const { Schema } = require('mongoose');
const dayjs = require('dayjs');
const calculateGoals = require('../utils/calculateGoals');

// User
const UserSchema = new Schema({
  name: String,
  avatar: String,
  bio: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isOrgAdmin: {
    type: Boolean,
    default: false,
  },
});

// Member
const MemberSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
    ref: 'User',
  },
  isAdmin: { type: Boolean, required: true, default: false },
  isGuide: { type: Boolean, default: false },
  //roles: [{ type: String, enum: ['ADMIN', 'GUIDE'] }],
  isApproved: { type: Boolean, required: true, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Dream' }],
}).index({ userId: 1, eventId: 1 }, { unique: true });

// Event
const EventSchema = new Schema({
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  title: { type: String, required: true },
  info: String,
  currency: String,
  registrationPolicy: {
    type: String,
    enum: ['OPEN', 'REQUEST_TO_JOIN', 'INVITE_ONLY'],
    default: 'OPEN',
    required: true,
  },
  totalBudget: Number,
  grantValue: Number,
  grantsPerMember: {
    type: Number,
    default: 10,
  },
  maxGrantsToDream: Number,
  dreamCreationCloses: Date,
  grantingOpens: Date,
  grantingCloses: Date,
  pretixEvent: String,
  guidelines: String,
  allowStretchGoals: { type: Boolean, default: false },
  customFields: [
    new Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      type: {
        type: String,
        enum: ['TEXT', 'MULTILINE_TEXT','BOOLEAN','ENUM','FILE'],
        default: 'TEXT',
        required: true,
      },
      isRequired: { type: Boolean, required: true },
      isShownOnFrontPage: Boolean,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }),
  ],
});

EventSchema.virtual('grantingIsOpen').get(function () {
  if (!this.grantingOpens) return false;

  const now = dayjs();
  const grantingOpens = dayjs(this.grantingOpens);

  if (this.grantingCloses) {
    const grantingCloses = dayjs(this.grantingCloses);
    return grantingOpens.isBefore(now) && now.isBefore(grantingCloses);
  } else {
    return grantingOpens.isBefore(now);
  }
});

EventSchema.virtual('grantingHasClosed').get(function () {
  if (!this.grantingCloses) return false;

  return dayjs().isBefore(dayjs(this.grantingCloses));
});

EventSchema.virtual('dreamCreationIsOpen').get(function () {
  if (!this.dreamCreationCloses) return true;

  const now = dayjs();
  const dreamCreationCloses = dayjs(this.dreamCreationCloses);

  return now.isBefore(dreamCreationCloses);
});

// Dream
const DreamSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, index: true, required: true },
  title: { type: String, required: true },
  summary: {
    type: String,
    maxlength: 160,
  },
  description: String,
  cocreators: [Schema.Types.ObjectId],
  customFields: [
    new Schema({
    fieldId: { type: Schema.Types.ObjectId, required: true },
    value: Schema.Types.Mixed,
  })],
  images: [new Schema({ small: String, large: String })],
  comments: [
    new Schema({
      authorId: Schema.Types.ObjectId,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      content: String,
    }),
  ],
  approved: { type: Boolean, default: false },
  budgetItems: [
    new Schema({
      description: { type: String, required: true },
      min: { type: Number, required: true },
      max: Number,
      type: {
        type: String,
        enum: ['INCOME', 'EXPENSE'],
        required: true,
      },
    }),
  ],
  published: { type: Boolean, default: false },
}).index({ title: 'text', description: 'text', summary: 'text' });

DreamSchema.virtual('minGoal').get(function () {
  const { min } = calculateGoals(this.budgetItems);
  return min;
});

DreamSchema.virtual('maxGoal').get(function () {
  const { max } = calculateGoals(this.budgetItems);
  return max;
});

const GrantSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  dreamId: { type: Schema.Types.ObjectId, required: true, index: true },
  memberId: { type: Schema.Types.ObjectId, required: true },
  value: { type: Number, required: true },
  reclaimed: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['PRE_FUND', 'USER', 'POST_FUND'],
    default: 'USER',
    required: true,
  },
});

const getModels = (db) => {
  return {
    User: db.model('User', UserSchema),
    Member: db.model('Member', MemberSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema),
    Grant: db.model('Grant', GrantSchema),
  };
};

module.exports = { getModels };
