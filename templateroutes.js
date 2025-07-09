export function defineRoutes(router) {
  router.get(
    '/templates',
    authenticate,
    authorizeUser,
    templateController.getAllTemplates
  )

  router.get(
    '/templates/:templateId',
    authenticate,
    authorizeUser,
    validateTemplateId,
    templateController.getTemplateById
  )

  router.post(
    '/templates',
    authenticate,
    authorizeUser,
    validateTemplatePayload,
    templateController.createTemplate
  )

  router.put(
    '/templates/:templateId',
    authenticate,
    authorizeUser,
    validateTemplateId,
    validateTemplatePayload,
    templateController.updateTemplate
  )

  router.delete(
    '/templates/:templateId',
    authenticate,
    authorizeAdmin,
    validateTemplateId,
    templateController.deleteTemplate
  )

  router.post(
    '/templates/:templateId/preview',
    authenticate,
    authorizeUser,
    validateTemplateId,
    templateController.generateTemplatePreview
  )

  router.post(
    '/templates/:templateId/export',
    authenticate,
    authorizeUser,
    validateTemplateId,
    templateController.exportTemplateSection
  )
}