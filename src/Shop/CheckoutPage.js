import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchCart, fetchProductDetails } from '../Service/ApiService';
import { USER_ID } from '../Constant';

function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const getCart = async () => {
      try {
        const data = await fetchCart(USER_ID);

        const orders = Array.isArray(data) ? data : [];

        const latestOrder = orders[orders.length - 1];

        const productsWithDetails = await Promise.all(
          (latestOrder.products || []).map(async (item) => {
            try {
              const productDetails = await fetchProductDetails(item.productId);
              return { ...productDetails, quantity: item.quantity };
            } catch (error) {
              console.error(`Error fetching details for productId ${item.productId}:`, error);
              return null;
            }
          })
        );

        setCart({ ...latestOrder, products: productsWithDetails });

        const total = productsWithDetails.reduce((acc, item) => acc + (item?.price || 0) * item.quantity, 0);
        setTotal(total);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    getCart();
  }, []);

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-center">Checkout Preview</h2>
      {cart.products && cart.products.length > 0 ? (
        <div>
          <Row>
            <Col md={8}>
              <ListGroup>
                {cart.products.map((item) => (
                  <ListGroup.Item key={item.productId}>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <h5>{item.title}</h5>
                        <p>
                          ${item.price} x {item.quantity}
                        </p>
                      </Col>
                      <Col md={4} className="text-end">
                        <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="text-center">Summary</Card.Title>
                  <hr />
                  <h5>Grand Total: ${total.toFixed(2)}</h5>
                  <div className="d-flex justify-content-center">
                    <Button variant="secondary">Preview Only</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <p>No items in the cart.</p>
      )}
    </Container>
  );
}

export default CheckoutPage;