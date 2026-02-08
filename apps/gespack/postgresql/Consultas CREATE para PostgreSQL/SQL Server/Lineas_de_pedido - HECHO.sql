USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Lineas_de_pedido]    Script Date: 02/11/2024 11:11:40 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Lineas_de_pedido](
	[Id] [nvarchar](255) NOT NULL,
	[PEDIDO] [nvarchar](255) NULL,
	[Linea] [int] NULL,
	[ID_REF] [nvarchar](255) NULL,
	[REF_ART] [nvarchar](255) NULL,
	[CATALOGO] [nvarchar](255) NULL,
	[Cantidad] [int] NULL,
	[Articulo] [nvarchar](255) NULL,
	[Precio] [money] NULL,
	[IMP] [money] NULL,
	[ABONADO] [nvarchar](255) NULL,
	[RESERVASTOCK] [bit] NOT NULL,
	[MARCA] [nvarchar](255) NULL,
	[IS_SUSTITUTIVO] [bit] NOT NULL,
	[ID_REF_SUST] [nvarchar](255) NULL,
	[REF_SUST] [nvarchar](255) NULL,
	[CATALOGO_SUST] [nvarchar](255) NULL,
	[CANT_SUST] [int] NULL,
	[DESC_SUST] [nvarchar](255) NULL,
	[IMP_SUST] [money] NULL,
	[IS_SIN_ARTICULO] [bit] NOT NULL,
	[FRASE_DISCULPA] [nvarchar](255) NULL,
	[IS_PESADO] [bit] NOT NULL,
 CONSTRAINT [PK_Lineas_de_pedido] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Lineas_de_pedido] ADD  CONSTRAINT [DF_Lineas_de_pedido_RESERVASTOCK]  DEFAULT ((0)) FOR [RESERVASTOCK]
GO

ALTER TABLE [dbo].[Lineas_de_pedido] ADD  CONSTRAINT [DF_Lineas_de_pedido_IS_SUSTITUTIVO]  DEFAULT ((0)) FOR [IS_SUSTITUTIVO]
GO

ALTER TABLE [dbo].[Lineas_de_pedido] ADD  CONSTRAINT [DF_Lineas_de_pedido_IS_SIN_ARTICULO]  DEFAULT ((0)) FOR [IS_SIN_ARTICULO]
GO

ALTER TABLE [dbo].[Lineas_de_pedido] ADD  CONSTRAINT [DF_Lineas_de_pedido_IS_PESADO]  DEFAULT ((0)) FOR [IS_PESADO]
GO


