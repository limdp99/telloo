export const RESERVED_SLUGS = ['s', 'api', 'admin', 'auth', 'login', 'signup', 'pricing', 'super-admin', 'dashboard', 'demo', '404', 'settings']

export const CATEGORIES = [
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'improvement', label: 'Improvement' },
]

export const FILTER_CATEGORIES = [
  { value: 'all', label: 'All' },
  ...CATEGORIES,
]

export const STATUSES = ['under_review', 'considering', 'planned', 'in_progress', 'completed', 'declined']

export const FILTER_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'considering', label: 'Considering' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
]

export const STATUS_LABELS = {
  under_review: 'Under Review',
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
}

export const CATEGORY_LABELS = {
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  improvement: 'Improvement',
}

export const CATEGORY_LABELS_SHORT = {
  feature_request: 'Feature',
  bug_report: 'Bug',
  improvement: 'Improvement',
}

export const PRIORITIES = [
  { value: 'empty', label: 'Empty' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB (feedback, comments)

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB (avatars, logos)
