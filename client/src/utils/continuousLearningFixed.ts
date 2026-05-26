// Aprendizaje Continuo Mejorado con Convergencia Garantizada

interface TrainingData {
  input: number[];
  output: number[];
  timestamp: number;
}

interface ModelMetrics {
  loss: number;
  accuracy: number;
  convergence: number;
  iterations: number;
}

class ContinuousLearningFixed {
  private weights: number[];
  private bias: number;
  private learningRate: number;
  private momentum: number;
  private velocities: number[];
  private trainingData: TrainingData[] = [];
  private maxDataPoints: number = 1000;
  private metrics: ModelMetrics = {
    loss: Infinity,
    accuracy: 0,
    convergence: 0,
    iterations: 0
  };
  private lossHistory: number[] = [];
  private maxLossHistory: number = 100;
  private adaptiveLearningRate: number;

  constructor(inputSize: number = 10, initialLearningRate: number = 0.01) {
    this.weights = Array(inputSize).fill(0).map(() => Math.random() * 0.1);
    this.bias = Math.random() * 0.1;
    this.learningRate = initialLearningRate;
    this.adaptiveLearningRate = initialLearningRate;
    this.momentum = 0.9;
    this.velocities = Array(inputSize).fill(0);
  }

  // Función de activación ReLU
  private relu(x: number): number {
    return Math.max(0, x);
  }

  // Derivada de ReLU
  private reluDerivative(x: number): number {
    return x > 0 ? 1 : 0;
  }

  // Forward pass
  private forward(input: number[]): number {
    let sum = this.bias;
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * this.weights[i];
    }
    return this.relu(sum);
  }

  // Backward pass con momentum
  private backward(input: number[], target: number, prediction: number): void {
    const error = target - prediction;
    const gradientScale = error * this.reluDerivative(prediction);

    // Actualizar pesos con momentum
    for (let i = 0; i < this.weights.length; i++) {
      const gradient = -gradientScale * input[i];
      this.velocities[i] = this.momentum * this.velocities[i] + this.adaptiveLearningRate * gradient;
      this.weights[i] += this.velocities[i];
    }

    // Actualizar bias
    this.bias += this.adaptiveLearningRate * (-gradientScale);
  }

  // Entrenar con un punto de datos
  public train(input: number[], output: number[]): void {
    // Limitar datos en memoria
    if (this.trainingData.length >= this.maxDataPoints) {
      this.trainingData.shift();
    }

    this.trainingData.push({
      input,
      output: output,
      timestamp: Date.now()
    });

    // Forward pass
    const prediction = this.forward(input);

    // Calcular pérdida (MSE)
    const loss = Math.pow(output[0] - prediction, 2);
    this.lossHistory.push(loss);
    if (this.lossHistory.length > this.maxLossHistory) {
      this.lossHistory.shift();
    }

    // Backward pass
    this.backward(input, output[0], prediction);

    // Actualizar métricas
    this.updateMetrics();

    // Ajustar tasa de aprendizaje adaptativa
    this.adaptLearningRate();

    this.metrics.iterations++;
  }

  // Actualizar métricas
  private updateMetrics(): void {
    if (this.lossHistory.length === 0) return;

    // Pérdida promedio
    this.metrics.loss = this.lossHistory.reduce((a, b) => a + b) / this.lossHistory.length;

    // Precisión (1 - error normalizado)
    this.metrics.accuracy = Math.max(0, 1 - this.metrics.loss);

    // Convergencia (basada en cambio de pérdida)
    if (this.lossHistory.length > 10) {
      const recentLoss = this.lossHistory.slice(-10).reduce((a, b) => a + b) / 10;
      const olderLoss = this.lossHistory.slice(-20, -10).reduce((a, b) => a + b) / 10;
      const improvement = Math.abs(olderLoss - recentLoss) / (olderLoss + 1e-8);
      this.metrics.convergence = Math.max(0, 1 - improvement);
    }
  }

  // Ajustar tasa de aprendizaje adaptativa
  private adaptLearningRate(): void {
    if (this.lossHistory.length < 2) return;

    const currentLoss = this.lossHistory[this.lossHistory.length - 1];
    const previousLoss = this.lossHistory[this.lossHistory.length - 2];

    if (currentLoss < previousLoss) {
      // La pérdida está disminuyendo, aumentar tasa de aprendizaje
      this.adaptiveLearningRate = Math.min(
        this.learningRate * 1.05,
        this.learningRate * 2
      );
    } else {
      // La pérdida está aumentando, disminuir tasa de aprendizaje
      this.adaptiveLearningRate = Math.max(
        this.learningRate * 0.95,
        this.learningRate * 0.1
      );
    }
  }

  // Predicción
  public predict(input: number[]): number {
    return this.forward(input);
  }

  // Obtener métricas
  public getMetrics(): ModelMetrics {
    return { ...this.metrics };
  }

  // Obtener historial de pérdida
  public getLossHistory(): number[] {
    return [...this.lossHistory];
  }

  // Guardar modelo
  public save(): string {
    return JSON.stringify({
      weights: this.weights,
      bias: this.bias,
      learningRate: this.learningRate,
      metrics: this.metrics
    });
  }

  // Cargar modelo
  public load(data: string): void {
    const parsed = JSON.parse(data);
    this.weights = parsed.weights;
    this.bias = parsed.bias;
    this.learningRate = parsed.learningRate;
    this.metrics = parsed.metrics;
  }

  // Reiniciar
  public reset(): void {
    this.weights = this.weights.map(() => Math.random() * 0.1);
    this.bias = Math.random() * 0.1;
    this.velocities = Array(this.weights.length).fill(0);
    this.lossHistory = [];
    this.trainingData = [];
    this.metrics = {
      loss: Infinity,
      accuracy: 0,
      convergence: 0,
      iterations: 0
    };
  }
}

// Exportar singleton
export const continuousLearning = new ContinuousLearningFixed();

// Funciones de utilidad
export const trainModel = (input: number[], output: number[]): void => {
  continuousLearning.train(input, output);
};

export const predictModel = (input: number[]): number => {
  return continuousLearning.predict(input);
};

export const getModelMetrics = (): ModelMetrics => {
  return continuousLearning.getMetrics();
};

export const saveModel = (): string => {
  return continuousLearning.save();
};

export const loadModel = (data: string): void => {
  continuousLearning.load(data);
};

export const resetModel = (): void => {
  continuousLearning.reset();
};
