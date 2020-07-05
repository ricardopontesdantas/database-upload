import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('The transaction value exceeded the cash value');
    }

    const categoryRepository = getRepository(Category);

    let checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      checkCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(checkCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: checkCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
