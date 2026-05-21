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

        stage('Debug Environment') {
            steps {
                bat 'echo NODE PATH && where node'
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
                bat 'npm install -D allure-commandline'
                bat 'npm install chromedriver@latest'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    withEnv(["ALLURE_REPORT_TAG_NAME=${params['Allure Report Tag Name']}"]) {
                        echo "Using Allure Report Tag Name: ${env.ALLURE_REPORT_TAG_NAME}"
                        bat 'npx wdio run ./wdio.conf.js'
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
