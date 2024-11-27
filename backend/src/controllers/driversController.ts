import { Request, Response } from 'express';
import  Driver  from '../models/drivers'; // Ajuste o caminho conforme a estrutura do projeto

// Busca todos os motoristas
export const getAll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const drivers = await Driver.findAll(); // Busca todos os motoristas
    return res.status(200).json(drivers);
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    return res.status(500).json({
      error_code: 'INTERNAL_SERVER_ERROR',
      error_description: 'Ocorreu um erro ao buscar os motoristas.',
    });
  }
};

// Busca um motorista por ID
export const getById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      error_code: 'INVALID_ID',
      error_description: 'O ID do motorista deve ser um número válido.',
    });
  }

  try {
    const driver = await Driver.findByPk(Number(id)); // Busca o motorista pelo ID

    if (!driver) {
      return res.status(404).json({
        error_code: 'DRIVER_NOT_FOUND',
        error_description: 'Nenhum motorista encontrado com o ID fornecido.',
      });
    }

    return res.status(200).json(driver);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    return res.status(500).json({
      error_code: 'INTERNAL_SERVER_ERROR',
      error_description: 'Ocorreu um erro ao buscar o motorista.',
    });
  }
};
