import { useEffect, useState } from 'react';
import socketIo from 'socket.io-client';

import { IOrder, TStatus } from '../../types/Order';
import { api } from '../../utils/api';
import { Board } from '../Board';
import * as S from './styles';

const ordersMock: IOrder[] = [
  {
    "_id": "637411eb234c8b31fcd96766",
    "table": "123",
    "status": "DONE",
    "products": [
      {
        "product": {
          "name": "Pizza 4 queijos",
          "imagePath": "1668544290613-quatro-queijos.png",
          "price": 40,
        },
        "quantity": 1,
        "_id": "637411eb234c8b31fcd96767"
      },
      {
        "product": {
          "name": "Coca-cola",
          "imagePath": "1668544997194-coca-cola.png",
          "price": 7,
        },
        "quantity": 2,
        "_id": "637411eb234c8b31fcd96768"
      }
    ],
  },
  {
    "_id": "637418cd769d3bceb5092e67",
    "table": "4",
    "status": "WAITING",
    "products": [
      {
        "product": {
          "name": "Coca-cola",
          "imagePath": "1668544997194-coca-cola.png",
          "price": 7,
        },
        "quantity": 1,
        "_id": "637418cd769d3bceb5092e68"
      }
    ],
  }
]

export function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);

  function handleCancelOrder(orderId: string) {
    setOrders((prevState) => prevState.filter(order => order._id !== orderId));
  }


  function handleStatusChange(orderId: string, status: TStatus) {
    setOrders((prevState) => prevState.map(order => (
      order._id === orderId
        ? { ...order, status }
        : order
    )))
  }


  useEffect(() => {
    api.get('orders')
      .then((response) => setOrders(response.data));
  }, [])


  useEffect(() => {
    const socket = socketIo(`http://${import.meta.env.VITE_API_URL}`, {
      transports: ['websocket'],
    });

    // socket.on('neworder', () => { console.log('novo pedido') })}, []);

    socket.on('neworder', (order) => {
      console.log(order)
      setOrders(prevState => prevState.concat(order));
    });

    // return () => { socket.disconnect() }
  }, []);

  const waiting = orders.filter(order => order.status === 'WAITING');
  const inProduction = orders.filter(order => order.status === 'IN_PRODUCTION');
  const done = orders.filter(order => order.status === 'DONE');

  return (
    <S.Container>
      <Board
        icon="🕒"
        title="Fila de espera"
        orders={waiting}
        onCancelOrder={handleCancelOrder}
        onChangeStatus={handleStatusChange}
      />
      <Board
        icon="👨‍🍳"
        title="Em preparação"
        orders={inProduction}
        onCancelOrder={handleCancelOrder}
        onChangeStatus={handleStatusChange}
      />
      <Board
        icon="✅"
        title="Pronto"
        orders={done}
        onCancelOrder={handleCancelOrder}
        onChangeStatus={handleStatusChange}
      />

    </S.Container>
  )
}
