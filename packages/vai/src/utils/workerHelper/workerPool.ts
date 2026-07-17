// import workerScript from './worker.js?raw'

// const blob = /*@__PURE__*/ new Blob([workerScript], { type: 'application/javascript' })
// const workerUrl = /*@__PURE__*/ URL.createObjectURL(blob)

interface Task {
  data: TaskData;
  transfers?: Transferable[];
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}
interface TaskData {
  /** 函数代码 */
  fnStr: string;
  /** 所有的入参 */
  args: any[];
  /** 额外信息 */
  [other: string]: any;
}
export class WorkerPool {
  poolSize: number;
  freeWorkers: Worker[];
  taskQueue: Task[];
  workerTaskMap: Map<Worker, Task>;

  constructor(poolSize?: number) {
    this.poolSize = poolSize || navigator.hardwareConcurrency / 2;
    this.freeWorkers = [];
    this.taskQueue = [];
    this.workerTaskMap = new Map();

    // 初始化 Worker 池
    this._initializePool();
  }

  _initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      this._createWorker();
    }
    console.log(`Worker 池初始化完成，共 ${this.poolSize} 个 Worker。`, this);
  }

  _createWorker() {
    const worker = new Worker(new URL("./worker.js", import.meta.url));
    this.freeWorkers.push(worker);

    worker.onmessage = (event) => this._onWorkerMessage(worker, event);
    worker.onerror = (error) => this._onWorkerError(worker, error);
  }

  /**
   * 向 Worker 池提交一个任务
   * @param {Object} taskData - 发送给 Worker 的任务数据, 配合 runInWorker,需要传入 {fnStr, args}
   * @returns {Promise} - 任务结果的 Promise
   */
  submitTask(taskData: TaskData, transfers?: Transferable[]) {
    return new Promise((resolve, reject) => {
      // 创建一个包装后的任务对象，包含 resolve 和 reject
      const task: Task = {
        data: taskData,
        transfers,
        resolve: resolve,
        reject: reject,
      };

      if (this.freeWorkers.length > 0) {
        const worker = this.freeWorkers.pop()!;
        this._assignTaskToWorker(worker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  _assignTaskToWorker(worker: Worker, task: Task) {
    if (task.transfers && task.transfers.length) {
      worker.postMessage({ ...task.data }, task.transfers);
    } else {
      worker.postMessage({ ...task.data });
    }
    this.workerTaskMap.set(worker, task);
  }

  _onWorkerMessage(worker: Worker, event: MessageEvent) {
    const { success, result, message } = event.data;
    const currentTask = this.workerTaskMap.get(worker);

    // 提交promise, 然后归还freeWorkers，检查剩余task
    if (currentTask) {
      if (success) {
        currentTask.resolve(result);
      } else {
        currentTask.reject(new Error(message));
      }

      this.workerTaskMap.delete(worker);
      this.freeWorkers.push(worker);

      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift()!;
        this._assignTaskToWorker(worker, nextTask);
      }
    }
  }

  // 理论上不会出现worker错误
  _onWorkerError(worker: Worker, error: ErrorEvent) {
    const currentTask = this.workerTaskMap.get(worker);
    if (currentTask) {
      currentTask.reject(new Error(`Worker 错误: ${error.message}`));
    }

    this.workerTaskMap.delete(worker);
    worker.terminate();

    this._createWorker();
  }
  terminate() {
    this.freeWorkers.forEach((worker) => worker.terminate());
    for (const [worker, task] of this.workerTaskMap.entries()) {
      worker.terminate();
      task.resolve(new Error(`Worker 已销毁`));
    }
    this.freeWorkers = [];
    this.taskQueue = [];
    this.workerTaskMap.clear();
  }
}
