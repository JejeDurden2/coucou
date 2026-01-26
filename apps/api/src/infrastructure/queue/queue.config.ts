import type { DefaultJobOptions } from 'bullmq';

export const EMAIL_QUEUE_NAME = 'email';
export const SCAN_QUEUE_NAME = 'scan';
export const SENTIMENT_QUEUE_NAME = 'sentiment-scan';
export const ONBOARDING_QUEUE_NAME = 'onboarding';

export const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s
  },
  removeOnComplete: {
    age: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  removeOnFail: {
    age: 30 * 24 * 60 * 60, // 30 days in seconds
  },
};

export const scanJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s, 10s, 20s (longer for LLM calls)
  },
  removeOnComplete: {
    age: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  removeOnFail: {
    age: 30 * 24 * 60 * 60, // 30 days in seconds
  },
};

export const sentimentJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 10000, // 10s, 20s, 40s (sentiment analysis is slower)
  },
  removeOnComplete: {
    age: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  removeOnFail: {
    age: 30 * 24 * 60 * 60, // 30 days in seconds
  },
};

export const onboardingJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 60000, // 60s, 120s, 240s (rate limit window is 1 min)
  },
  removeOnComplete: {
    age: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  removeOnFail: {
    age: 30 * 24 * 60 * 60, // 30 days in seconds
  },
};
