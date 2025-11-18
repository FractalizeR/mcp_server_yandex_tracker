/**
 * Data Transfer Objects (DTO)
 *
 * ВАЖНО: DTO используются для type-safe отправки данных в API.
 * Содержат known поля + index signature [key: string]: unknown
 * для поддержки кастомных полей Яндекс.Трекера.
 */

// Issue DTO
export type {
  CreateIssueDto,
  UpdateIssueDto,
  SearchIssuesDto,
  FindIssuesInputDto,
  ExecuteTransitionDto,
} from './issue/index.js';

// Attachment DTO
export type {
  UploadAttachmentInput,
  DownloadAttachmentInput,
  AttachmentOutput,
  AttachmentsListOutput,
  DownloadAttachmentOutput,
} from './attachment/index.js';

// DTO Factories (runtime code for coverage)
export {
  createMinimalCreateIssueDto,
  createFullCreateIssueDto,
  createUpdateIssueDto,
  createSearchIssuesDto,
  createFindIssuesByQuery,
  createFindIssuesByFilter,
  createFindIssuesByKeys,
  createFindIssuesByQueue,
  createExecuteTransitionDto,
  createEmptyExecuteTransitionDto,
} from './issue/index.js';
