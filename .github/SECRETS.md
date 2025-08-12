# ===========================================
# GITHUB ACTIONS SECRETS CONFIGURATION
# ===========================================
# Configuración de secrets necesarios para CI/CD

# Ir a: https://github.com/tu-usuario/tu-repo/settings/secrets/actions
# Agregar los siguientes secrets:

# ===========================================
# GOOGLE CLOUD PLATFORM
# ===========================================
GCP_SA_KEY='{
  "type": "service_account",
  "project_id": "ai-academy-461719",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@ai-academy-461719.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/github-actions%40ai-academy-461719.iam.gserviceaccount.com"
}'

# Para crear este service account:
# 1. gcloud iam service-accounts create github-actions
# 2. gcloud projects add-iam-policy-binding ai-academy-461719 --member="serviceAccount:github-actions@ai-academy-461719.iam.gserviceaccount.com" --role="roles/container.developer"
# 3. gcloud projects add-iam-policy-binding ai-academy-461719 --member="serviceAccount:github-actions@ai-academy-461719.iam.gserviceaccount.com" --role="roles/container.clusterAdmin"
# 4. gcloud iam service-accounts keys create key.json --iam-account=github-actions@ai-academy-461719.iam.gserviceaccount.com

# ===========================================
# DATABASE SECRETS
# ===========================================
DATABASE_URL="mysql://lms_user:TU_PASSWORD@34.122.241.221:3306/lms_platform?ssl-mode=REQUIRED"
DATABASE_READ_URL="mysql://lms_user:TU_PASSWORD@REPLICA_IP:3306/lms_platform?ssl-mode=REQUIRED"

# ===========================================
# AUTHENTICATION SECRETS
# ===========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# ===========================================
# PAYMENT SECRETS
# ===========================================
STRIPE_API_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ===========================================
# VIDEO PROCESSING SECRETS
# ===========================================
MUX_TOKEN_ID="your_mux_token_id"
MUX_TOKEN_SECRET="your_mux_token_secret"

# ===========================================
# FILE UPLOAD SECRETS
# ===========================================
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="app_..."

# ===========================================
# GOOGLE CLOUD STORAGE
# ===========================================
GOOGLE_CLOUD_PROJECT_ID="ai-academy-461719"
GOOGLE_CLOUD_BUCKET_NAME="tu-lms-videos-bucket"

# ===========================================
# REDIS SECRETS
# ===========================================
REDIS_PASSWORD="secure_redis_password_here"

# ===========================================
# MONITORING SECRETS
# ===========================================
CODECOV_TOKEN="your_codecov_token_here"

# ===========================================
# NOTIFICATION SECRETS (OPCIONAL)
# ===========================================
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# ===========================================
# BACKUP SECRETS (OPCIONAL)
# ===========================================
GCS_BACKUP_BUCKET="lms-platform-backups"
BACKUP_ENCRYPTION_KEY="your_backup_encryption_key"

# ===========================================
# INSTRUCCIONES DE CONFIGURACIÓN
# ===========================================

# 1. CREAR SERVICE ACCOUNT EN GCP:
# gcloud iam service-accounts create github-actions \
#   --display-name="GitHub Actions Service Account"

# 2. ASIGNAR ROLES:
# gcloud projects add-iam-policy-binding ai-academy-461719 \
#   --member="serviceAccount:github-actions@ai-academy-461719.iam.gserviceaccount.com" \
#   --role="roles/container.developer"

# gcloud projects add-iam-policy-binding ai-academy-461719 \
#   --member="serviceAccount:github-actions@ai-academy-461719.iam.gserviceaccount.com" \
#   --role="roles/container.clusterAdmin"

# 3. CREAR KEY:
# gcloud iam service-accounts keys create github-actions-key.json \
#   --iam-account=github-actions@ai-academy-461719.iam.gserviceaccount.com

# 4. CONFIGURAR SECRETS EN GITHUB:
# - Ir a tu repositorio en GitHub
# - Settings > Secrets and variables > Actions
# - Agregar cada secret con su respectivo valor

# ===========================================
# VERIFICAR CONFIGURACIÓN
# ===========================================

# Para verificar que los secrets están configurados:
# 1. Ir a GitHub Actions
# 2. Ejecutar el workflow
# 3. Verificar que no hay errores de autenticación

# ===========================================
# SEGURIDAD
# ===========================================

# IMPORTANTE:
# - Nunca commitear este archivo con valores reales
# - Rotar secrets regularmente
# - Usar least privilege principle
# - Monitorear uso de service accounts
# - Revocar keys no utilizadas

# ===========================================
# TROUBLESHOOTING
# ===========================================

# Error: "permission denied"
# Solución: Verificar roles del service account

# Error: "authentication failed"
# Solución: Verificar formato del JSON key

# Error: "resource not found"
# Solución: Verificar project ID y región

# Error: "quota exceeded"
# Solución: Verificar limits en GCP console
