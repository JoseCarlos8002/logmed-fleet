
import React from 'react';
import { Vehicle, VehicleStatus, Driver, Task, CityCost } from './types';

export const VEHICLES_DATA: Vehicle[] = [
  {
    id: '1',
    model: 'Fiat Fiorino',
    plate: 'ABC-1234',
    status: VehicleStatus.ACTIVE,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu7RsSf4ia0MlE4SzNufBuIuQwYeQye2sbrL_-ZovelUnVp2UT0RxZ0M-chZXIt1TJ9bgBYn7DaaERozPy8gUMJumWzzzKPaMQRQlUJ98lTg-xtMuGgEQk7nsfTFHR_-M1xjhX6ZzJ0i_-0wkteLVpHsqB6zL2pmZQpRqxkdgGsH_YrxyF2rxurc1EvL-6AKARV1Lvt-aXqpwULBeTKd4QdpZefePaFPDDUHZN5hNPC4GIyotN4Pv1cwkka_-ftGOGOjK6ZqvRmkWj',
    avgConsumption: 10.5,
    costPerKm: 0.45,
    currentKm: 124500,
    lastRefill: '14/05',
    driver: 'Carlos Silva',
    year: 2022
  },
  {
    id: '2',
    model: 'Renault Master',
    plate: 'DEF-5678',
    status: VehicleStatus.ATTENTION,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeqM8Dqp9WCIysG2Hkg35LVTGdnpcKF2UZpvr31SUM9mQmXLeCijcYRjdCVpiSDsT54Nzh5VcP3Axhwf3cPzbkLaeIo6whf9p0jDKZsIe2Da95LLZAk4zEsKS1zVGYrZK1Yd5eBfeztosf7ROHVQ4in3lsy6Zv0b87NjPs0FGRdnvb0d70cOee204OTvEkKUnJtf7AN5_jD09plmKzf4hUrJ4iO3lBHQVmWSmsbWo8f9S_3Ma7hy5ou6EVB-eLx5nShiXLMJWqxCCs',
    avgConsumption: 8.2,
    costPerKm: 0.62,
    currentKm: 210300,
    lastRefill: '12/05',
    maintenanceNote: 'Troca de óleo vencida há 2 dias. Agende a manutenção.',
    driver: 'Roberto Santos',
    year: 2021
  },
  {
    id: '3',
    model: 'Ambulância UTI',
    plate: 'GHI-9012',
    status: VehicleStatus.MAINTENANCE,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiqDlCFCpdk5HXFXLSUQQAuDyXg1BS4E-qNw71JCojA-aQkE1ktV5W3G5hgQTlQckgY2DQHvO0Vbsc9RiHUc52o-eLn1Pw-bDWz_YsGkc0Bq7EX8ujixxoRki3OfLtxLybCh7c0LAY2cCdyNGAv0M-bEUcUHxJ45cr5eT97d74tMCmhSKZdvggLC34nqH4p_giDbryO2J9iBGEpICGPqTexJkOVP00eiorJwULtw1fvRKcfpYtdxuVvPkNOt4_fwFoPfUuSodP2Xoc',
    avgConsumption: 6.5,
    costPerKm: 0.85,
    currentKm: 85000,
    lastRefill: '08/05',
    maintenanceNote: 'Oficina Central - Reparo no sistema de freios e suspensão traseira.',
    year: 2023
  }
];

export const DRIVERS_DATA: Driver[] = [
  {
    id: 'd1',
    name: 'Carlos Mendes',
    plate: 'ABC-1234',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTfoyZ5-C2nknLG5_GK4RaJ1UXDodNgejcLYWd9h34T96yqOK0315dN7AqNF8DV6AY_4UVHCOIL1vOm5HJZ_0hVS0zJZuZrgvqGNtvliKBotdhA3VkIg1pfq-SCmgqUfv2NvI0qatcvqnhfk-PLSSjbsq7jCKfPoDpMOVEFR6JoIkobydgsvCYf0dbsrtyNUdsMuJHO0-7pveMEh46ZHQra7QOtSPXxGzlJtagtbA7Ji3Gt9LhsPmJr2f32569_ZeXGediOVxjHiPM',
    status: 'active',
    revenue: 5400,
    dailyRoutes: 3,
    monthlyRoutes: 42
  },
  {
    id: 'd2',
    name: 'Ana Souza',
    plate: 'XYZ-9876',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4MyLDifzfkBdeTxH-aQMtBj4vboCDT15Egf0LiYiaD7q9xZmvLZLciQ_XToowptG8eEOjGSndFVQ8hati50N4MUh_lF-Lr54vmns2pDkabYcDooUiMOEJ0xl4OEpmUtItBvA0FNvy75TbFnCauf7su0h-1AOwU15CWLhvHCSvnDXvGNrqH8ZZKxAXxr2wQ6nvVHWdL1F5KH0WpfhPjpRhJ9Ym5lR74XXDEZM6lmSbgynL8o3EfCqBHkD4GmZ2eyhAdAKmZFR5BzY0',
    status: 'inactive',
    revenue: 1250,
    dailyRoutes: 0,
    monthlyRoutes: 8
  }
];

export const TASKS_DATA: Task[] = [
  {
    id: 't1',
    title: 'Reabastecer UTI - Leito 4',
    description: 'Entrega urgente de kit de medicamentos cardiológicos.',
    priority: 'high',
    category: 'ALTA PRIORIDADE',
    responsible: 'Dr. Silva',
    responsiblePhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNG7b71bS0IbqpGlOKHgGDC8zYla884nvXxvUiKax3swIYUADUsdGTJWJXdEAR2cme4lokjvbVM32G90yf8MkWQSlELZzHewLMZpQNr60f9n3F27Wsn2mKW4Hq3m7YVByPMkHWUZhkEhjnLHdV7V98MirsP7SUe7u0PhnsqLn6qneVT-ObuNuHYzXgxS3pFBqlcD1qHZalJXmHzZfReWf8hOB-rs_79CSS7jXo9PBw-ys_0RJbyNmPlK1KXXdV7MH0Zkc41Hl1aPr4',
    time: '14:00',
    status: 'todo'
  },
  {
    id: 't2',
    title: 'Rota Zona Norte',
    description: 'Verificar disponibilidade da van 03 para rota noturna.',
    priority: 'medium',
    category: 'LOGÍSTICA',
    responsible: 'M. Paula',
    status: 'todo'
  }
];

export const CITY_COSTS: CityCost[] = [
  { id: 'c1', name: 'Ribeirão Preto', region: 'Zona Urbana Principal', state: 'São Paulo', type: 'fixed', value: 150.00, updatedAt: '12 Out, 2023' },
  { id: 'c2', name: 'Sertãozinho', region: 'Região Metropolitana', state: 'São Paulo', type: 'perKm', value: 2.50, updatedAt: '10 Out, 2023' },
  { id: 'c3', name: 'Franca', region: 'Interior', state: 'São Paulo', type: 'fixed', value: 180.00, updatedAt: '05 Out, 2023' }
];

export const ROUTES_DATA = [
  { id: 'R-101', driver: 'Carlos Mendes', vehicle: 'Fiat Fiorino (ABC-1234)', stops: 8, completed: 5, status: 'Em Curso', eta: '16:30' },
  { id: 'R-102', driver: 'Roberto Santos', vehicle: 'Renault Master (DEF-5678)', stops: 12, completed: 12, status: 'Concluído', eta: '14:00' },
  { id: 'R-103', driver: 'Ana Souza', vehicle: 'Van Executiva (XYZ-9876)', stops: 4, completed: 0, status: 'Planejado', eta: '18:00' },
];

export const CALENDAR_EVENTS = [
  { id: 1, title: 'Troca de Óleo - ABC-1234', date: '2024-05-25', type: 'maintenance', color: '#dc2626' },
  { id: 2, title: 'Vistoria Sanitária - Van 02', date: '2024-05-26', type: 'inspection', color: '#d97706' },
  { id: 3, title: 'Treinamento Motoristas', date: '2024-05-28', type: 'event', color: '#1e3a8a' },
];

export const CLOSURES_DATA = [
  { id: 'CL-001', driver: 'Carlos Mendes', period: '01/05 - 15/05', total: 2450.00, status: 'Fechado' },
  { id: 'CL-002', driver: 'Ana Souza', period: '01/05 - 15/05', total: 1120.00, status: 'Pendente' },
  { id: 'CL-003', driver: 'Roberto Santos', period: '01/05 - 15/05', total: 3890.00, status: 'Fechado' },
];
