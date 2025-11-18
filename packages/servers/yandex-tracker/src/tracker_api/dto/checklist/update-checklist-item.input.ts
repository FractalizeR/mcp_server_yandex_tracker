/**
 * DTO для обновления элемента чеклиста
 *
 * Используется в UpdateChecklistItemOperation и yandex_tracker_update_checklist_item tool.
 *
 * API: PATCH /v2/issues/{issueId}/checklistItems/{checklistId}
 *
 * Все поля опциональны (partial update)
 */
export interface UpdateChecklistItemInput {
  /** Текст элемента чеклиста */
  text?: string | undefined;

  /** Статус выполнения элемента */
  checked?: boolean | undefined;

  /** ID назначенного лица */
  assignee?: string | undefined;

  /** Дедлайн в формате ISO 8601 */
  deadline?: string | undefined;
}
