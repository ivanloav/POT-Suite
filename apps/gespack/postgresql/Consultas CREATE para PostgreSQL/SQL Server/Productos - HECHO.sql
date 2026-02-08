USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Productos]    Script Date: 02/11/2024 11:13:25 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Productos](
	[ID] [nvarchar](255) NOT NULL,
	[REFERENCIA] [nvarchar](255) NOT NULL,
	[CATALOGO] [nvarchar](255) NULL,
	[ACCION] [nvarchar](255) NULL,
	[DESCRIPCION] [nvarchar](255) NULL,
	[PESO] [decimal](10, 3) NULL,
	[IVA] [decimal](10, 3) NULL,
	[UBICACION_PICKING] [nvarchar](255) NULL,
	[UBICACION_ALMACEN] [nvarchar](255) NULL,
	[EMBALAJE] [tinyint] NULL,
	[PRECIO] [money] NULL,
	[UNIDADES_PACK] [int] NULL,
	[STOCK] [int] NULL,
	[COSTE] [money] NULL,
	[INF_ADICIONAL] [nvarchar](255) NULL,
	[TIPO_IVA] [tinyint] NULL,
	[FECHA_ALTA] [datetime] NULL,
	[ESTADO] [nvarchar](255) NULL,
	[STOCKBLOQUEADO] [smallint] NULL,
	[PESADO] [bit] NOT NULL,
 CONSTRAINT [PK_Productos_2] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Productos] ADD  CONSTRAINT [DF_Productos_PESADO]  DEFAULT ((0)) FOR [PESADO]
GO


