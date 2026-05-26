pipeline {
    agent any

    parameters {
        string(
            name: "Allure Report Tag Name",
            description: "Enter a tag name for the Allure Report",
            defaultValue: "Owner"
        )
    }

    tools {
        nodejs 'NodeJS'
    }

    environment {
        ALLURE_RESULTS = 'allure-results'
        ALLURE_REPORT = 'allure-report'

        // Use workspace-local temp folders instead of C:\Windows\Temp
        TEMP = "${WORKSPACE}\\tmp"
        TMP  = "${WORKSPACE}\\tmp"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                powershell '''
                    Write-Host "Cleaning corrupted chromedriver cache..."

                    Remove-Item -Recurse -Force "C:\\Windows\\Temp\\chromedriver" -ErrorAction SilentlyContinue
                    Remove-Item -Recurse -Force "$env:WORKSPACE\\tmp\\chromedriver" -ErrorAction SilentlyContinue

                    Write-Host "Creating local temp directory..."

                    New-Item -ItemType Directory -Force -Path "$env:WORKSPACE\\tmp"

                    Write-Host "TEMP = $env:TEMP"
                    Write-Host "TMP  = $env:TMP"
                '''
            }
        }

        stage('Debug Environment') {
            steps {
                bat 'echo NODE PATH && where node'
                bat 'node -v'
                bat 'npm -v'
                bat 'echo TEMP=%TEMP%'
                bat 'echo TMP=%TMP%'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm cache clean --force'

                // Clean install is safer on Jenkins
                bat 'npm ci || npm install'

                bat 'npm install -D allure-commandline'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    withEnv(["ALLURE_REPORT_TAG_NAME=${params['Allure Report Tag Name']}"]) {

                        echo "Using Allure Report Tag Name: ${env.ALLURE_REPORT_TAG_NAME}"

                        // Force webdriver/chromedriver to use workspace temp
                        bat '''
                        set TEMP=%WORKSPACE%\\tmp
                        set TMP=%WORKSPACE%\\tmp

                        npx wdio run ./wdio.conf.js
                        '''
                    }
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat 'npx allure generate allure-results --clean -o allure-report'
            }
        }
    }

    post {

        always {

            archiveArtifacts artifacts: 'allure-report/**/*.*', allowEmptyArchive: true

            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']]
            ])
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}