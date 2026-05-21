pipeline {
    agent any

    parameters {
        string(name: "Allure Report Tag Name", description: "Enter a tag name for the Allure Report", defaultValue: "Owner")
    }

    tools {
        nodejs 'NodeJS'
    }

    environment {
        ALLURE_RESULTS = 'allure-results'
        ALLURE_REPORT = 'allure-report'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                  withEnv([ALLURE_REPORT_TAG_NAME: params.ALLURE_REPORT_TAG_NAME]) {
                    echo "Using Allure Report Tag Name: ${ALLURE_REPORT_TAG_NAME}"
                  }
                }
                sh 'npx wdio run ./wdio.conf.js'
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh 'npm run allure:generate'
                sh 'npm run allure:open'
            }
        }
    }

    post {

        always {

            // Archive allure report files
            archiveArtifacts artifacts: 'allure-report/**/*.*', allowEmptyArchive: true

            // Publish allure report in Jenkins
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
