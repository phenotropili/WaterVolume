const {cloneDeep, min, max} = require('lodash');

const createMatrix = (rowCount, colCount, maxValue) => {
  const matrix = new Array(rowCount);

  for (let i = 0; i < matrix.length; i++) {
    matrix[i] = new Array(colCount);

    for (let j = 0; j < matrix[i].length; j++) {
      matrix[i][j] = Math.round(Math.random() * maxValue);
    }
  }

  return matrix;
}

// Получаем координаты точек вокруг точки i:j
const getSurroundingPoints = (matrix, i, j) => {
  const result = [
    [i, j - 1],
    [i - 1, j],
    [i, j + 1],
    [i + 1, j],
  ]

  return result.filter(([i, j]) => i >= 0 && j >= 0 && i < matrix.length && j < matrix[i].length);
}

const print = matrix => {
  for (let i = 0; i < matrix.length; i++) {
    const str = matrix[i]
      .map(value => {
        const strValue = value.toString();
        return strValue.length < 2 ? ' ' + strValue : strValue;
      })
      .join(' ');

      console.log(str);
  }
}

// Получаем срез поверхности на заданной высоте.
// В точках, получившихся пустыми и где может находиться вода, будет 1. В остальных 0.
const getLayer = (matrix, height) => {
  const layerMatrix = cloneDeep(matrix);

  for (let i = 0; i < layerMatrix.length; i++) {
    for (let j = 0; j < layerMatrix[i].length; j++) {
      layerMatrix[i][j] = layerMatrix[i][j] < height ? 1 : 0;
    }
  }

  return layerMatrix;
}

// Находим набор точек для непрерывной пустой области на срезе. Обычный обход графа в ширину нерекурсивный.
const findContinuousArea = (matrix, startI, startJ) => {
  const current = matrix[startI][startJ];

  if (!current) {
    return [];
  }

  const queue = [
    [startI, startJ]
  ];
  const processedPoints = {}
  const areaPoints = [];

  while(queue.length) {
    const [i, j] = queue.pop();
    const strKey = `${i}:${j}`;
    if (processedPoints[strKey]) {
      continue;
    } else {
      processedPoints[strKey] = true;
    }

    const currentValue = matrix[i][j];

    if (currentValue) {
      areaPoints.push([i, j]);

      const surrPoints = getSurroundingPoints(matrix, i, j);

      surrPoints.forEach(point => {
        const [pointI, pointJ] = point;
        const pointKey = `${pointI}:${pointJ}`;
        if (!processedPoints[pointKey]) {
          queue.push(point);
        }
      });
    }
  }

  return areaPoints;
}

// Проверяем, валидна ли найденная пустая область. Области с пустотами на границе невалидны, т.к. вода выльется за эти границы.
const checkAreaValid = (matrix, areaPoints) => areaPoints.every(([i, j]) => i > 0 && j > 0 && i < matrix.length - 1 && j < matrix[i].length - 1);

// Получаем сумму площадей пустых областей на срезе
const getLayerEmptySquare = (layerMatrix, invalidPoints) => {
  const processedPoints = {};
  let sum = 0;

  for (let i = 0; i < layerMatrix.length; i++) {
    for (let j = 0; j < layerMatrix[i].length; j++) {
      const currentKey = `${i}:${j}`;
      // console.log(currentKey);

      if (invalidPoints[currentKey] || processedPoints[currentKey]) {
        // console.log('Point has been processed');
        continue;
      }

      const area = findContinuousArea(layerMatrix, i, j);
      // console.log(area);

      if (area.length) {
        const isAreaValid = checkAreaValid(layerMatrix, area);
        // console.log(`Is area valid: ${isAreaValid}`);

        area.forEach(point => {
          const [pointI, pointJ] = point;
          const strKey = `${pointI}:${pointJ}`;

          processedPoints[strKey] = true;
          if (!isAreaValid) {
            invalidPoints[strKey] = true;
          }
        })

        if (isAreaValid) {
          sum += area.length;
        }

        // console.log(`Sum: ${sum}`);
      }
    }
  }

  return sum;
}

// Считаем общий объем жидкости на нашей поверхности
const getWaterVolume = matrix => {
  const minHeight = min(matrix.map(row => min(row)));
  const maxHeight = max(matrix.map(row => max(row)));

  let volume = 0;
  const zStep = 1;

  const invalidPoints = {};

  for (let z = minHeight + 1; z <= maxHeight; z += zStep) {
    const layerMatrix = getLayer(matrix, z);
    console.log(`Z = ${z}`);
    console.log('Matrix:');
    print(matrix);
    console.log('Layer matrix:')
    print(layerMatrix);

    const layerEmptySquare = getLayerEmptySquare(layerMatrix, invalidPoints);
    console.log(`Layer empty square: ${layerEmptySquare}`);
    console.log('------------');

    volume += layerEmptySquare * zStep;
  }

  return volume;
}

const matrix = createMatrix(6, 6, 10);

print(matrix);
console.log();

const volume = getWaterVolume(matrix);

console.log(`Water volume: ${volume}`);