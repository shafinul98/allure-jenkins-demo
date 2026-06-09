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
                // Clean install is safer on Jenkins
                bat 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    withEnv([
                          "ALLURE_REPORT_TAG_NAME=${params['Allure Report Tag Name']}",
                          "TEMP=${env.WORKSPACE}\\tmp",
                          "TMP=${env.WORKSPACE}\\tmp",
                          "WDIO_CACHE_DIR=${env.WORKSPACE}\\wdio-cache"
                        ]) {

                        echo "Using Allure Report Tag Name: ${env.ALLURE_REPORT_TAG_NAME}"

                        // Force webdriver/chromedriver to use workspace temp
                        bat '''
                        npx wdio run ./wdio.conf.js --logLevel debug
                        '''
                    }
                }
            }
        }
    }

    post {

        always {
            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']]
            ])

            script {
                def workspacePath = pwd()
                def reportFolder = "${workspacePath}\\allure-report"
                def zipFile = "${workspacePath}\\allure-report.zip"

                if (fileExists(reportFolder)) {
                    powershell """
                      if (Test-Path "${zipFile}") {
                        Remove-Item "${zipFile}" -Force
                      }
                      Compress-Archive -Path "${reportFolder}" -DestinationPath "${zipFile}" -Force
                    """
                    archiveArtifacts artifacts: 'allure-report.zip', allowEmptyArchive: false
                }

                emailext(
                    to: 'shafinul98@gmail.com',
                    subject: "Allure Report for build ${env.BUILD_NUMBER}",
                    body: """<html>
                        <body>
                            <p>Build ${env.BUILD_NUMBER} completed.</p>
                            <p>Allure Report: <a href="${env.BUILD_URL}allure/">${env.BUILD_URL}allure/</a></p>
                            <p>Please find the detailed report attached.</p>
                        </body>
                    </html>""",
                    mimeType: 'text/html',
                    attachmentsPattern: 'allure-report.zip',
                    attachLog: true,
                )
            }
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}