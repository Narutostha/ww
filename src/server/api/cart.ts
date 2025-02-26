import { prisma } from '@/lib/db'

export async function getCart(userId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!cart) {
    return await prisma.cart.create({
      data: {
        userId,
        items: {}
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
  }

  return cart
}

export async function addToCart(userId: string, productId: string, size: string, quantity: number) {
  let cart = await prisma.cart.findFirst({
    where: { userId }
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId
      }
    })
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_size: {
        cartId: cart.id,
        productId,
        size
      }
    }
  })

  if (existingItem) {
    return await prisma.cartItem.update({
      where: {
        id: existingItem.id
      },
      data: {
        quantity: existingItem.quantity + quantity
      },
      include: {
        product: true
      }
    })
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      size,
      quantity
    },
    include: {
      product: true
    }
  })
}

export async function removeFromCart(userId: string, itemId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId }
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  return await prisma.cartItem.delete({
    where: {
      id: itemId,
      cartId: cart.id
    }
  })
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  const cart = await prisma.cart.findFirst({
    where: { userId }
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  if (quantity <= 0) {
    return await prisma.cartItem.delete({
      where: {
        id: itemId,
        cartId: cart.id
      }
    })
  }

  return await prisma.cartItem.update({
    where: {
      id: itemId,
      cartId: cart.id
    },
    data: {
      quantity
    }
  })
}